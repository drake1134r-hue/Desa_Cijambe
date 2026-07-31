import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

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
  return publicData.publicUrl;
}

export async function saveUploadedFile(file: any, folder: string) {
  // Basic checks for file-like object
  const fileType = file?.type;
  const fileNameRaw = file?.name || "upload";
  const fileSize = typeof file?.size === "number" ? file.size : undefined;

  if (fileType && !ALLOWED_TYPES.includes(fileType)) {
    throw new Error("Tipe file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.");
  }

  if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi 5 MB.");
  }

  const fileName = String(fileNameRaw).replace(/[^a-zA-Z0-9.-]/g, "_");
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
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Gagal mengunggah ke Supabase Storage: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    console.warn("Supabase Storage tidak tersedia, fallback ke upload lokal:", err);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}
