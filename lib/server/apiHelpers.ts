import { getToken } from "next-auth/jwt";
import { Readable } from "stream";
import { ensureAdmin } from "@/lib/server/admin";
import { saveUploadedFile } from "@/lib/server/upload";
import { sanitizeText } from "@/lib/server/validation";

export async function requireAdmin(req: Request) {
  const session = await ensureAdmin(await requireAuthSession(req));
  return session;
}

function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

export async function requireAuthSession(req: Request) {
  const token = await getToken({
    req: req as unknown as Parameters<typeof getToken>[0]["req"],
    secret: getAuthSecret(),
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    return null;
  }

  return {
    user: {
      id: token.sub ?? undefined,
      name: typeof token.name === "string" ? token.name : undefined,
      email: typeof token.email === "string" ? token.email : undefined,
      username: typeof token.username === "string" ? token.username : undefined,
      role: token.role,
    },
  };
}

function parseBoundary(contentType: string) {
  const match = /boundary=(?:(?:"([^"]+)")|([^;]+))/i.exec(contentType);
  return match ? match[1] || match[2] : null;
}

function splitBuffer(buffer: Buffer, delimiter: Buffer) {
  const parts: Buffer[] = [];
  let start = 0;
  while (start < buffer.length) {
    const index = buffer.indexOf(delimiter, start);
    if (index === -1) {
      parts.push(buffer.subarray(start));
      break;
    }
    parts.push(buffer.subarray(start, index));
    start = index + delimiter.length;
  }
  return parts;
}

async function parseMultipartFormData(req: Request, contentType: string) {
  const bodyBuffer = Buffer.from(await req.arrayBuffer());
  const boundaryValue = parseBoundary(contentType);
  console.log("parseMultipartFormData - contentType:", contentType);
  console.log("parseMultipartFormData - detected boundary:", boundaryValue);
  console.log("parseMultipartFormData - bodyBuffer length:", bodyBuffer.length);

  if (!boundaryValue) {
    throw new Error("Boundary multipart/form-data tidak ditemukan");
  }

  const boundary = Buffer.from(`--${boundaryValue}`);
  const parts = splitBuffer(bodyBuffer, boundary).slice(1);
  console.log("parseMultipartFormData - parts count:", parts.length);
  const result: Record<string, any> = {};

  for (const part of parts) {
    const trimmed = part.subarray(0, part.length - 2); // remove trailing CRLF
    const section = trimmed.toString("latin1");
    console.log("parseMultipartFormData - part length:", part.length, "trimmed length:", trimmed.length);
    if (section === "--" || section.trim() === "") {
      continue;
    }

    const headerEnd = trimmed.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      continue;
    }

    const headerText = trimmed.subarray(0, headerEnd).toString("latin1");
    console.log("parseMultipartFormData - headerText snippet:", headerText.slice(0, 300));
    const body = trimmed.subarray(headerEnd + 4);

    const headers: Record<string, string> = {};
    for (const line of headerText.split("\r\n")) {
      const [name, ...rest] = line.split(":");
      if (!name || rest.length === 0) continue;
      headers[name.toLowerCase().trim()] = rest.join(":").trim();
    }

    const disposition = headers["content-disposition"];
    if (!disposition) continue;

    const nameMatch = /name="([^"]+)"/.exec(disposition);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    const filenameMatch = /filename="([^"]*)"/.exec(disposition);
    if (filenameMatch) {
      const originalFilename = filenameMatch[1] || fieldName;
      const contentTypeHeader = headers["content-type"] || "application/octet-stream";
      const fileBuffer = Buffer.from(body);
      // Diagnostic log: report parsed file metadata (do not log binary content)
      console.log("parseMultipartFormData - parsed file:", {
        field: fieldName,
        name: originalFilename,
        type: contentTypeHeader,
        size: fileBuffer.length,
      });

      result[fieldName] = {
        name: originalFilename,
        type: contentTypeHeader,
        size: fileBuffer.length,
        buffer: fileBuffer,
        arrayBuffer: async () => fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength),
        stream: () => Readable.from(fileBuffer),
        _readableState: {},
      };
    } else {
      const value = body.toString("utf8");
      console.log("parseMultipartFormData - parsed field:", { field: fieldName, value: String(value).slice(0, 200) });
      result[fieldName] = value;
    }
  }

  console.log("parseMultipartFormData - finished, keys:", Object.keys(result));
  return result;
}

export async function parseRequestBody(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.startsWith("multipart/form-data")) {
    return await parseMultipartFormData(req, contentType);
  }

  const json = await req.json().catch(() => null);
  return json ?? {};
}

export function parseBooleanField(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return false;
}

export function parseNumberField(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeStoredImageUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  return null;
}

export async function parseFileField(value: unknown, folder: string) {
  // Allow string URLs to pass through verbatim so edit/create routes can retain a known image source.
  if (typeof value === "string") {
    return normalizeStoredImageUrl(value);
  }

  // Accept file-like objects from formData. Avoid instanceof File since runtime may differ.
  if (!value || typeof value !== "object") return null;
  const maybeFile: any = value as any;

  const hasFileLikeShape =
    typeof maybeFile.name === "string" ||
    typeof maybeFile.type === "string" ||
    typeof maybeFile.size === "number" ||
    typeof maybeFile.arrayBuffer === "function" ||
    typeof maybeFile.stream === "function";

  if (!hasFileLikeShape) return null;

  try {
    // Log file info for debugging (always, not just dev)
    console.log("parseFileField - Processing file:", {
      name: maybeFile.name || "unknown",
      type: maybeFile.type || "unknown",
      size: maybeFile.size || "unknown",
      hasArrayBuffer: typeof maybeFile.arrayBuffer === "function",
      hasStream: typeof maybeFile.stream === "function",
      isBuffer: maybeFile instanceof Buffer,
      folder,
    });

    return await saveUploadedFile(maybeFile, folder);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("parseFileField error:", {
      fileName: maybeFile.name || "unknown",
      folder,
      error: errorMsg,
      fileKeys: Object.keys(maybeFile).slice(0, 20), // log first 20 keys for debugging
    });
    throw err;
  }
}

export function sanitizeField(value: unknown) {
  return sanitizeText(value);
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status);
}

export function parseRequestUrl(req: Request) {
  const urlString = String(req.url ?? "");

  // Relative request URLs may arrive in server route handlers, especially during internal fetch calls.
  // Use a fallback base when the URL is not absolute.
  if (urlString.startsWith("/")) {
    return new URL(urlString, "http://localhost");
  }

  try {
    return new URL(urlString);
  } catch (err) {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const host = req.headers.get("host") ?? "localhost";
    try {
      return new URL(urlString, `${proto}://${host}`);
    } catch (err2) {
      return new URL("/", "http://localhost");
    }
  }
}
