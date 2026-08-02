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
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader?.();
  
  if (reader) {
    // web ReadableStream
    console.log("streamToBuffer - Using web ReadableStream");
    try {
      let chunkCount = 0;
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

  // Node.js stream fallback
  console.log("streamToBuffer - Using Node.js stream");
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
    
    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error("Stream read timeout"));
    }, 30000);
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
  // Validate file-like object exists
  if (!file || typeof file !== "object") {
    throw new Error("File object tidak valid");
  }

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

  // Read file to buffer FIRST, then check size
  let buffer: Buffer | null = null;
  let readError: Error | null = null;

  // Try multiple methods to read file
  if (typeof file.arrayBuffer === "function") {
    try {
      console.log("Attempting arrayBuffer read...");
      const ab = await file.arrayBuffer();
      console.log("arrayBuffer result:", { byteLength: ab?.byteLength, type: typeof ab });
      if (ab && ab.byteLength > 0) {
        buffer = Buffer.from(ab);
        console.log("Successfully read via arrayBuffer, buffer size:", buffer.length);
      }
    } catch (err) {
      readError = err instanceof Error ? err : new Error(String(err));
      console.error("arrayBuffer error:", readError.message);
    }
  }

  // Fallback: try stream
  if (!buffer && typeof file.stream === "function") {
    try {
      console.log("Attempting stream read...");
      const s = file.stream();
      const streamBuffer = await streamToBuffer(s);
      console.log("Stream result:", { bufferLength: streamBuffer?.length });
      if (streamBuffer && streamBuffer.length > 0) {
        buffer = streamBuffer;
        readError = null;
        console.log("Successfully read via stream, buffer size:", buffer.length);
      } else {
        readError = new Error("Stream mengembalikan buffer kosong");
      }
    } catch (err) {
      if (!readError) {
        readError = err instanceof Error ? err : new Error(String(err));
      }
      console.error("Stream error:", readError.message);
    }
  }

  // Fallback: handle if already a Buffer
  if (!buffer && file instanceof Buffer) {
    try {
      console.log("File is already a Buffer, size:", file.length);
      if (file.length > 0) {
        buffer = file;
        readError = null;
        console.log("Using Buffer directly, size:", buffer.length);
      } else {
        readError = new Error("Buffer kosong");
      }
    } catch (err) {
      readError = err instanceof Error ? err : new Error(String(err));
      console.error("Buffer check error:", readError.message);
    }
  }

  // Fallback: try Node stream if present
  if (!buffer && file._readableState) {
    try {
      console.log("Attempting Node stream read...");
      const nodeBuffer = await streamToBuffer(file);
      console.log("Node stream result:", { bufferLength: nodeBuffer?.length });
      if (nodeBuffer && nodeBuffer.length > 0) {
        buffer = nodeBuffer;
        readError = null;
        console.log("Successfully read via Node stream, buffer size:", buffer.length);
      } else {
        readError = new Error("Node stream mengembalikan buffer kosong");
      }
    } catch (err) {
      if (!readError) {
        readError = err instanceof Error ? err : new Error(String(err));
      }
      console.error("Node stream error:", readError.message);
    }
  }

  // If still no buffer, throw detailed error
  if (!buffer) {
    const detailMsg = readError?.message || "Format tidak didukung";
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
