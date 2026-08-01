import { findMany, findOne, insertOne } from "@/lib/db/index";
import { umkms } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseFileField, parseRequestBody, jsonResponse, errorResponse, normalizeStoredImageUrl } from "@/lib/server/apiHelpers";

export const GET = async (req: Request) => {
  try {
    const url = parseRequestUrl(req);
    const status = url.searchParams.get("status");
    const query = url.searchParams.get("search");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "0");

    const filter: Record<string, unknown> = {
      status: { $ne: "deleted" },
    };
    if (status && status !== "all") {
      filter.status = status;
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { owner: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ];
    }

    const options: Record<string, number | Record<string, 1 | -1>> = {
      sort: { created_at: -1 },
    };

    let hasNext = false;
    if (limit > 0) {
      const skip = Math.max(0, page - 1) * limit;
      options.skip = skip;
      options.limit = limit + 1;
    }

    const items = await findMany(umkms.collectionName, filter, options);
    let result = items;

    if (limit > 0 && items.length > limit) {
      hasNext = true;
      result = items.slice(0, limit);
    }

    if (limit > 0) {
      return jsonResponse({ items: result, hasNext, page });
    }

    return jsonResponse(result);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat UMKM", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);

    let photoUrl: string | null = null;
    if (body.photo !== undefined && body.photo !== null && body.photo !== "") {
      try {
        photoUrl = await parseFileField(body.photo, "umkm");
      } catch (err) {
        console.error("Failed to save uploaded photo for umkm:", err);
        return errorResponse("Upload foto gagal. Pastikan file valid dan konfigurasi Supabase storage sudah benar.", 400);
      }
    }

    const fallbackPhotoUrl = normalizeStoredImageUrl(body.photo);

    const result = await insertOne(umkms.collectionName, {
      name: sanitizeText(body.name),
      owner: sanitizeText(body.owner),
      category: sanitizeText(body.category),
      address: sanitizeText(body.address),
      description: sanitizeContent(body.description),
      whatsapp: sanitizeText(body.whatsapp),
      photo_url: photoUrl ?? fallbackPhotoUrl,
      google_maps_url: sanitizeText(body.googleMapsUrl),
      status: sanitizeText(body.status) || "draft",
    });

    const item = await findOne(umkms.collectionName, { id: result.id });
    return jsonResponse(item, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal membuat UMKM", 500);
  }
};