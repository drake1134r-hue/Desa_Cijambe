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
  if (!fileName) return false;

  // Fallback: check file extension FIRST (most reliable)
  const fileExtension = path.extname(fileName).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return true;
  }

  // If no MIME type provided, we already checked extension - accept it if extension valid
  if (!mimeType) {
    return false;
  }

  // Direct match for known types
  if (ALLOWED_TYPES.includes(mimeType)) {
    return true;
  }

  // Extended MIME type variations
  const extendedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/x-jpeg",
    "image/x-jpg",
    "image/png",
    "image/x-png",
    "image/webp",
    "image/x-webp",
  ];

  return extendedTypes.includes(mimeType);
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
  // Basic checks for file-like object
  let fileType = file?.type;
  let fileNameRaw = file?.name || "upload";
  const fileSize = typeof file?.size === "number" ? file.size : undefined;

  // Sanitize and normalize file name
  let fileName = String(fileNameRaw)
    .split(/[\\/]/)
    .pop() // Get filename from path if present
    ?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload";

  // If no extension found and we have a type, try to infer extension from MIME type
  if (!path.extname(fileName) && fileType) {
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
    const ext = mimeToExt[fileType];
    if (ext) {
      fileName = `${fileName}${ext}`;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("saveUploadedFile - Validating:", {
      originalName: fileNameRaw,
      sanitizedName: fileName,
      type: fileType || "unknown",
      size: fileSize,
    });
  }

  // Flexible MIME type validation with fallback to extension checking
  if (!isAllowedImageType(fileType, fileName)) {
    const fileExt = path.extname(fileName).toLowerCase();
    throw new Error(
      `Tipe file tidak didukung: ${fileExt || "tidak diketahui"}. Format yang diizinkan: JPG, JPEG, PNG, atau WEBP.`
    );
  }

  if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi 1 MB.");
  }

  const extension = path.extname(fileName) || ".jpg";
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
