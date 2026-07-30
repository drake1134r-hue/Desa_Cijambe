import { findMany, insertOne } from "@/lib/db/index";
import { comments } from "@/lib/db/schema";
import { parseRequestBody, parseRequestUrl, parseNumberField, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";
import { sanitizeContent, sanitizeText } from "@/lib/server/validation";

export const GET = async (req: Request) => {
  try {
    const url = parseRequestUrl(req);
    const limit = parseNumberField(url.searchParams.get("limit"), 10);

    const recentComments = await findMany(comments.collectionName, {}, {
      sort: { created_at: -1 },
      limit: Math.min(Math.max(limit, 1), 100),
    });

    return jsonResponse(recentComments);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat komentar", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await parseRequestBody(req);
    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email);
    const message = sanitizeContent(body.message);

    if (!name) {
      return errorResponse("Nama wajib diisi", 400);
    }

    if (!message) {
      return errorResponse("Komentar wajib diisi", 400);
    }

    await insertOne(comments.collectionName, {
      name,
      email: email || null,
      message,
    });

    return jsonResponse({ success: true, message: "Komentar berhasil dikirim" }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal mengirim komentar", 500);
  }
};
