import { findMany, findOne, insertOne } from "@/lib/db/index";
import { awards } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseFileField, parseNumberField, parseRequestBody, jsonResponse, errorResponse, normalizeStoredImageUrl } from "@/lib/server/apiHelpers";

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
        { title: { $regex: query, $options: "i" } },
        { organizer: { $regex: query, $options: "i" } },
      ];
    }

    const items = await findMany(awards.collectionName, filter, { sort: { order: "asc" } });

    return jsonResponse(items);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat penghargaan", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);

    const result = await insertOne(awards.collectionName, {
      title: sanitizeText(body.title),
      year: parseNumberField(body.year, new Date().getFullYear()),
      organizer: sanitizeText(body.organizer),
      description: sanitizeContent(body.description),
      order: parseNumberField(body.order, 0),
      is_active: body.isActive ? parseBooleanField(body.isActive) : true,
    });

    const item = await findOne(awards.collectionName, { id: result.id });
    return jsonResponse(item, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal membuat penghargaan", 500);
  }
};