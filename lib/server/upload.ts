import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "uploads";

// More flexible MIME type matching
function isAllowedImageType(mimeType: string | undefined, fileName: string): boolean {
  // If we have a valid MIME type, check it first
  if (mimeType) {
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/x-jpeg",
      "image/x-jpg",
      "image/png",
      "image/x-png",
      "image/webp",
      "image/x-webp",
    ];
    if (validMimes.includes(mimeType)) {
      return true;
    }
  }

  // Check file extension if present
  if (fileName) {
    const fileExtension = path.extname(fileName).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return true;
    }
  }

  // If we have no filename but a valid MIME, accept it
  if (mimeType) {
    return true;
  }

  return false;
}

async function streamToBuffer(stream: any) {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader?.();
  if (reader) {
    // web ReadableStream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)));
  }

  // Node.js stream fallback
  return new Promise<Buffer>((resolve, reject) => {
    const bufs: Buffer[] = [];
    stream.on("data", (d: Buffer) => bufs.push(Buffer.from(d)));
    stream.on("end", () => resolve(Buffer.concat(bufs)));
    stream.on("error", (err: any) => reject(err));
  });
}

function getSupabaseStorageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return null;
  }

  if (typeof key === "string" && /^(sb_publishable_|sb_anon_)/.test(key)) {
    return null;
  }

  return { url, key };
}

async function uploadToSupabase(file: any, folder: string, safeName: string, buffer: Buffer) {
  const config = getSupabaseStorageConfig();
  if (!config) {
    return null;
  }

  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const storagePath = `${folder}/${safeName}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType: typeof file?.type === "string" ? file.type : "application/octet-stream",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  const publicUrl = publicData?.publicUrl?.trim();
  if (publicUrl) {
    return publicUrl;
  }

  const { data: signedData, error: signedError } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, 60 * 60 * 24);
  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  throw new Error(signedError?.message ?? "Tidak dapat menghasilkan URL gambar yang bisa ditampilkan.");
}

export async function saveUploadedFile(file: any, folder: string) {
  // Validate file-like object
  if (!file || typeof file !== "object") {
    throw new Error("File object tidak valid");
  }

  const fileType = file?.type || "";
  let fileNameRaw = file?.name || "";
  const fileSize = typeof file?.size === "number" ? file.size : undefined;

  // Log incoming file info for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("DEBUG saveUploadedFile:", {
      hasName: !!fileNameRaw,
      fileName: fileNameRaw,
      fileType,
      fileSize,
    });
  }

  // Check file size first
  if (fileSize === undefined || fileSize === 0) {
    throw new Error("File kosong atau ukuran tidak terdeteksi");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi 1 MB.");
  }

  // Extract and sanitize file name from path
  let fileName = fileNameRaw
    ? String(fileNameRaw)
        .split(/[\\/]/)
        .pop() // Get filename from path if present
        ?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload"
    : "upload";

  let extension = path.extname(fileName).toLowerCase();

  // If no extension and we have MIME type, infer from MIME
  if (!extension && fileType) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/x-jpeg": ".jpg",
      "image/x-jpg": ".jpg",
      "image/x-png": ".png",
      "image/x-webp": ".webp",
    };
    extension = mimeToExt[fileType] || ".jpg";
  }

  // Default to .jpg if still no extension
  if (!extension) {
    extension = ".jpg";
  }

  // Update fileName with proper extension
  if (fileName !== "upload" && !fileName.toLowerCase().endsWith(extension)) {
    fileName = fileName.split(".")[0] + extension;
  } else if (fileName === "upload") {
    fileName = "upload" + extension;
  }

  // Validate file type with more lenient approach
  if (fileSize > 0) {
    // Accept if file has content, regardless of MIME/extension detection
    // But still log warning if type doesn't look like an image
    if (!fileType || !fileType.startsWith("image/")) {
      if (process.env.NODE_ENV === "development") {
        console.warn("File uploaded without proper MIME type:", {
          type: fileType,
          name: fileName,
        });
      }
    }
  } else {
    throw new Error("File kosong");
  }

  if (process.env.NODE_ENV === "development") {
    console.log("DEBUG processed file:", {
      sanitizedName: fileName,
      extension,
      type: fileType || "unknown",
      size: fileSize,
    });
  }

  const safeName = `${Date.now()}-${randomUUID()}${extension}`;

  // try arrayBuffer -> stream -> buffer
  let buffer: Buffer;
  try {
    if (typeof file.arrayBuffer === "function") {
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (typeof file.stream === "function") {
      const s = file.stream();
      buffer = await streamToBuffer(s);
    } else if (file instanceof Buffer) {
      buffer = file;
    } else if (file._readableState) {
      // node stream
      buffer = await streamToBuffer(file);
    } else {
      throw new Error("Tidak dapat membaca file upload: format tidak didukung.");
    }
  } catch (err) {
    throw new Error(`Gagal memproses file upload: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const uploadedUrl = await uploadToSupabase(file, folder, safeName, buffer);
    if (uploadedUrl) {
      return uploadedUrl;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Gagal mengunggah ke Supabase Storage: ${message}. Pastikan variabel lingkungan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah dikonfigurasi di Vercel.`
      );
    }

    console.warn("Supabase Storage tidak tersedia, fallback ke upload lokal:", err);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Upload file tidak tersedia pada environment production. Pastikan variabel lingkungan Supabase storage sudah dikonfigurasi dengan benar."
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}
