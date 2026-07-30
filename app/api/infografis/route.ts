import { findMany, findOne, insertOne } from "@/lib/db/index";
import { infographics } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText } from "@/lib/server/validation";
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
        { title: { $regex: query, $options: "i" } },
      ];
    }

    const items = await findMany(infographics.collectionName, filter, { sort: { order: 1 } });

    return jsonResponse(items);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat infografis", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);

    const result = await insertOne(infographics.collectionName, {
      title: sanitizeText(body.title),
      value: sanitizeText(body.value),
      unit: sanitizeText(body.unit),
      icon: sanitizeText(body.icon),
      order: parseNumberField(body.order, 0),
      is_active: body.isActive ? parseBooleanField(body.isActive) : true,
    });

    const item = await findOne(infographics.collectionName, { id: result.id });
    return jsonResponse(item, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal membuat infografis", 500);
  }
};