import { findMany, findOne, insertOne } from "@/lib/db/index";
import { homepageContents } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseNumberField, parseRequestBody, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const GET = async (req: Request) => {
  try {
    const url = parseRequestUrl(req);
    const status = url.searchParams.get("status");
    const query = url.searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.is_active = status === "active" || status === "true";
    }
    if (query) {
      filter.$or = [
        { label: { $regex: query, $options: "i" } },
        { key: { $regex: query, $options: "i" } },
      ];
    }

    const items = await findMany(homepageContents.collectionName, filter, { sort: { order: 1 } });
    return jsonResponse(items);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat konten beranda", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);
    const key = sanitizeText(body.key);
    const label = sanitizeText(body.label);
    const title = sanitizeText(body.title);

    if (!key || !label || !title) {
      return errorResponse("Key, label, dan judul harus diisi", 400);
    }

    const result = await insertOne(homepageContents.collectionName, {
      key,
      label,
      title,
      subtitle: sanitizeText(body.subtitle),
      content: sanitizeContent(body.content),
      extra: sanitizeContent(body.extra),
      order: parseNumberField(body.order, 0),
      is_active: body.isActive ? parseBooleanField(body.isActive) : true,
    });

    const item = await findOne(homepageContents.collectionName, { id: result.id });
    return jsonResponse(item, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal membuat konten beranda", 500);
  }
};
