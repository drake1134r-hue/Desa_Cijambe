import { getToken } from "next-auth/jwt";
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

export async function parseRequestBody(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.startsWith("multipart/form-data")) {
    const formData = await req.formData();
    const body: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    return body;
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

export async function parseFileField(value: unknown, folder: string) {
  // Accept file-like objects from formData. Avoid instanceof File since runtime may differ.
  if (!value || typeof value !== "object") return null;
  const maybeFile: any = value as any;
  if (!maybeFile.name) return null;
  // If it's already a string (URL), skip
  if (typeof maybeFile === "string") return null;
  try {
    return await saveUploadedFile(maybeFile, folder);
  } catch (err) {
    console.error("parseFileField error:", err);
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
