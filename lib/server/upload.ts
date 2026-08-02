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
  if (!stream) {
    throw new Error("Stream kosong");
  }

  console.log("streamToBuffer - START, checking stream type...");

  // Web ReadableStream
  if (typeof stream.getReader === "function") {
    console.log("streamToBuffer - Using web ReadableStream");
    if (typeof Response === "function") {
      try {
        const ab = await new Response(stream).arrayBuffer();
        if (ab && ab.byteLength > 0) {
          const buffer = Buffer.from(ab);
          console.log(`streamToBuffer - Web stream success via Response, size: ${buffer.length}`);
          return buffer;
        }
      } catch (responseErr) {
        console.warn("streamToBuffer - Response fallback failed for web stream:", responseErr instanceof Error ? responseErr.message : String(responseErr));
      }
    }

    const chunks: Uint8Array[] = [];
    try {
      let chunkCount = 0;
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`streamToBuffer - Web stream done, received ${chunkCount} chunks`);
          break;
        }
        if (value) {
          chunkCount++;
          chunks.push(value);
        }
      }
    } catch (err) {
      throw new Error(`Web stream read error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (chunks.length === 0) {
      throw new Error("Stream kosong (tidak ada data)");
    }

    const result = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    console.log(`streamToBuffer - Web stream success, result size: ${result.length}`);
    return result;
  }

  // Async iterable stream support
  if (typeof stream[Symbol.asyncIterator] === "function") {
    console.log("streamToBuffer - Using async iterable stream");
    const chunks: Uint8Array[] = [];
    let chunkCount = 0;
    try {
      for await (const chunk of stream) {
        if (chunk) {
          chunkCount++;
          chunks.push(Buffer.from(chunk));
        }
      }
    } catch (err) {
      throw new Error(`Async iterable stream read error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (chunks.length === 0) {
      throw new Error("Stream kosong (tidak ada data)");
    }

    const result = Buffer.concat(chunks);
    console.log(`streamToBuffer - Async iterable stream success, result size: ${result.length}`);
    return result;
  }

  // Node.js stream fallback
  if (typeof stream.on === "function") {
    console.log("streamToBuffer - Using Node.js stream");
    if (typeof Response === "function") {
      try {
        const ab = await new Response(stream as any).arrayBuffer();
        if (ab && ab.byteLength > 0) {
          const buffer = Buffer.from(ab);
          console.log(`streamToBuffer - Node stream success via Response, size: ${buffer.length}`);
          return buffer;
        }
      } catch (responseErr) {
        console.warn("streamToBuffer - Response fallback failed for Node stream:", responseErr instanceof Error ? responseErr.message : String(responseErr));
      }
    }

    return new Promise<Buffer>((resolve, reject) => {
      let hasData = false;
      let chunkCount = 0;
      const bufs: Buffer[] = [];

      stream.on("data", (d: any) => {
        hasData = true;
        chunkCount++;
        bufs.push(Buffer.from(d));
      });

      stream.on("end", () => {
        console.log(`streamToBuffer - Node stream end, received ${chunkCount} chunks`);
        if (!hasData) {
          reject(new Error("Node stream kosong (tidak ada data)"));
        } else {
          const result = Buffer.concat(bufs);
          console.log(`streamToBuffer - Node stream success, result size: ${result.length}`);
          resolve(result);
        }
      });

      stream.on("error", (err: any) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`streamToBuffer - Node stream error: ${errMsg}`);
        reject(new Error(`Node stream error: ${errMsg}`));
      });

      setTimeout(() => {
        reject(new Error("Stream read timeout"));
      }, 30000);
    });
  }

  throw new Error("Jenis stream tidak dikenali");
}

async function readFileBuffer(file: any) {
  if (!file || typeof file !== "object") {
    throw new Error("File tidak valid untuk dibaca");
  }

  if (file instanceof Buffer) {
    if (file.length === 0) {
      throw new Error("Buffer kosong");
    }
    return file;
  }

  const errors: string[] = [];

  if (typeof file.stream === "function") {
    try {
      console.log("readFileBuffer - Trying stream...");
      const stream = file.stream();
      const buffer = await streamToBuffer(stream);
      if (buffer && buffer.length > 0) {
        return buffer;
      }
      errors.push("stream kosong");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`stream error: ${errMsg}`);
      console.error("readFileBuffer - stream error:", errMsg);
    }
  }

  if (typeof file.arrayBuffer === "function") {
    try {
      console.log("readFileBuffer - Trying arrayBuffer...");
      const ab = await file.arrayBuffer();
      if (ab && ab.byteLength > 0) {
        const buffer = Buffer.from(ab);
        console.log("readFileBuffer - arrayBuffer success, size:", buffer.length);
        return buffer;
      }
      errors.push("arrayBuffer kosong");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`arrayBuffer error: ${errMsg}`);
      console.error("readFileBuffer - arrayBuffer error:", errMsg);
    }
  }

  if (typeof Response === "function") {
    try {
      console.log("readFileBuffer - Trying Response fallback...");
      const ab = await new Response(file).arrayBuffer();
      if (ab && ab.byteLength > 0) {
        const buffer = Buffer.from(ab);
        console.log("readFileBuffer - Response fallback success, size:", buffer.length);
        return buffer;
      }
      errors.push("Response fallback kosong");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Response fallback error: ${errMsg}`);
      console.error("readFileBuffer - Response fallback error:", errMsg);
    }
  }

  if (file?._readableState) {
    try {
      console.log("readFileBuffer - Trying Node stream fallback...");
      const buffer = await streamToBuffer(file);
      if (buffer && buffer.length > 0) {
        return buffer;
      }
      errors.push("Node stream kosong");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Node stream error: ${errMsg}`);
      console.error("readFileBuffer - Node stream error:", errMsg);
    }
  }

  if (ArrayBuffer.isView(file)) {
    const buffer = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
    if (buffer.length > 0) {
      console.log("readFileBuffer - Using ArrayBuffer view, size:", buffer.length);
      return buffer;
    }
    errors.push("ArrayBuffer view kosong");
  }

  if (typeof Blob === "function") {
    try {
      console.log("readFileBuffer - Trying Blob fallback...");
      const blob = new Blob([file]);
      const ab = await blob.arrayBuffer();
      if (ab && ab.byteLength > 0) {
        const buffer = Buffer.from(ab);
        console.log("readFileBuffer - Blob fallback success, size:", buffer.length);
        return buffer;
      }
      errors.push("Blob fallback kosong");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Blob fallback error: ${errMsg}`);
      console.error("readFileBuffer - Blob fallback error:", errMsg);
    }
  }

  throw new Error(errors.length > 0 ? errors.join(" | ") : "Format tidak didukung");
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
  // Validate file-like object exists
  if (!file || typeof file !== "object") {
    throw new Error("File object tidak valid");
  }

  console.log("saveUploadedFile - constructor:", file?.constructor?.name);
  console.log("saveUploadedFile - file object:", file);

  const fileType = file?.type || "";
  let fileNameRaw = file?.name || "";

  // Log incoming file info for debugging (always)
  console.log("saveUploadedFile START:", {
    hasName: !!fileNameRaw,
    fileName: fileNameRaw || "unknown",
    fileType: fileType || "unknown",
    fileSize: file?.size,
    hasArrayBuffer: typeof file.arrayBuffer === "function",
    hasStream: typeof file.stream === "function",
    isBuffer: file instanceof Buffer,
    hasReadableState: !!file._readableState,
  });

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

  const safeName = `${Date.now()}-${randomUUID()}${extension}`;

  // Read file to buffer using a robust helper
  let buffer: Buffer;
  try {
    buffer = await readFileBuffer(file);
  } catch (err) {
    const detailMsg = err instanceof Error ? err.message : String(err);
    console.error("Failed to read file buffer:", {
      error: detailMsg,
      tryMethods: {
        arrayBuffer: typeof file.arrayBuffer === "function",
        stream: typeof file.stream === "function",
        Buffer: file instanceof Buffer,
        nodeStream: !!file._readableState,
      },
    });
    throw new Error(`Gagal membaca file upload: ${detailMsg}. Metode: arrayBuffer=${typeof file.arrayBuffer === "function"}, stream=${typeof file.stream === "function"}, Buffer=${file instanceof Buffer}`);
  }

  // NOW check buffer size (after successfully reading)
  if (buffer.length === 0) {
    throw new Error("File kosong atau tidak dapat dibaca.");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi 1 MB.");
  }

  console.log("saveUploadedFile SUCCESS - buffer ready, size:", buffer.length);

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
