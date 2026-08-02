import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { umkms } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseFileField, parseRequestBody, jsonResponse, errorResponse, normalizeStoredImageUrl } from "@/lib/server/apiHelpers";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const item = await findOne(umkms.collectionName, { id: Number(id) });

    if (!item) {
      return errorResponse("UMKM tidak ditemukan", 404);
    }

    return jsonResponse(item);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat UMKM", 500);
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const body = await parseRequestBody(req);

    let photoUrl: string | null = null;
    if (body.photo !== undefined && body.photo !== null && body.photo !== "") {
      try {
        photoUrl = await parseFileField(body.photo, "umkm");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Failed to save uploaded photo for umkm:", errorMsg);
        return errorResponse(`Upload foto gagal: ${errorMsg}`, 400);
      }
    }

    const data: Record<string, unknown> = {
      name: sanitizeText(body.name),
      owner: sanitizeText(body.owner),
      category: sanitizeText(body.category),
      address: sanitizeText(body.address),
      description: sanitizeContent(body.description),
      whatsapp: sanitizeText(body.whatsapp),
      google_maps_url: sanitizeText(body.googleMapsUrl),
    };

    if (photoUrl) {
      data.photo_url = photoUrl;
    } else {
      const normalizedPhotoUrl = normalizeStoredImageUrl(body.photo);
      if (normalizedPhotoUrl) {
        data.photo_url = normalizedPhotoUrl;
      }
    }

    if (body.status !== undefined) {
      data.status = sanitizeText(body.status);
    }

    await updateOne(umkms.collectionName, { id: Number(id) }, data);
    const updated = await findOne(umkms.collectionName, { id: Number(id) });

    return jsonResponse(updated);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memperbarui UMKM", 500);
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(_req);

    const { id } = await params;
    await deleteOne(umkms.collectionName, { id: Number(id) });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus UMKM", 500);
  }
};