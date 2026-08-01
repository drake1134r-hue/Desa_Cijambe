import { findMany, findOne, insertOne } from "@/lib/db/index";
import { organizationStructures } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseFileField, parseNumberField, parseRequestBody, jsonResponse, errorResponse, normalizeStoredImageUrl } from "@/lib/server/apiHelpers";

export const GET = async (req: Request) => {
  try {
    const url = parseRequestUrl(req);
    const status = url.searchParams.get("status");
    const query = url.searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (!status) {
      filter.is_active = true;
    } else if (status !== "all") {
      filter.is_active = status === "active" || status === "true";
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
      ];
    }

    const items = await findMany(organizationStructures.collectionName, filter);

    return jsonResponse(items);
  } catch (error) {
    console.error(error);    if (error instanceof Response) {
      return error;
    }    return errorResponse("Gagal memuat struktur organisasi", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);

    let photoUrl: string | null = null;
    try {
      photoUrl = await parseFileField(body.photo, "struktur-organisasi");
    } catch (err) {
      console.warn("Failed to save uploaded photo for struktur-organisasi:", err);
    }

    const fallbackPhotoUrl = normalizeStoredImageUrl(body.photo);
    const structureTitle = sanitizeText(body.title ?? body.position);

    if (!structureTitle) {
      return errorResponse("Jabatan harus diisi", 400);
    }

    const result = await insertOne(organizationStructures.collectionName, {
      name: sanitizeText(body.name),
      title: structureTitle,
      description: sanitizeContent(body.description),
      photo_url: photoUrl ?? fallbackPhotoUrl,
      order: parseNumberField(body.order, 0),
      is_active: body.isActive ? parseBooleanField(body.isActive) : true,
    });

    const item = await findOne(organizationStructures.collectionName, { id: result.id });
    return jsonResponse(item, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    const message = error instanceof Error ? error.message : "Gagal membuat data struktur organisasi";
    return errorResponse(message, 500);
  }
};