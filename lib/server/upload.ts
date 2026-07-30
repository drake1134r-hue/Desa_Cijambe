import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(uploadDir, { recursive: true });

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

  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}
