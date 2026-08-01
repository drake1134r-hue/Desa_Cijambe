import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { organizationStructures } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseFileField, parseNumberField, parseRequestBody, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const item = await findOne(organizationStructures.collectionName, { id: Number(id) });

    if (!item) {
      return errorResponse("Data tidak ditemukan", 404);
    }

    return jsonResponse(item);
  } catch (error) {
    console.error(error);    if (error instanceof Response) {
      return error;
    }    return errorResponse("Gagal memuat item struktur organisasi", 500);
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const body = await parseRequestBody(req);

    let photoUrl: string | null = null;
    try {
      photoUrl = await parseFileField(body.photo, "struktur-organisasi");
    } catch (err) {
      console.warn("Failed to save uploaded photo for struktur-organisasi:", err);
    }

    const structureTitle = sanitizeText(body.title ?? body.position);
    const data: Record<string, unknown> = {
      name: sanitizeText(body.name),
      title: structureTitle,
      description: sanitizeContent(body.description),
    };

    if (photoUrl) {
      data.photo_url = photoUrl;
    } else if (body.photo) {
      data.photo_url = sanitizeText(body.photo);
    }

    const orderValue = parseNumberField(body.order, undefined as any);
    if (orderValue !== undefined) {
      data.order = orderValue;
    }

    if (body.isActive !== undefined) {
      data.is_active = parseBooleanField(body.isActive);
    }

    await updateOne(organizationStructures.collectionName, { id: Number(id) }, data);
    const updated = await findOne(organizationStructures.collectionName, { id: Number(id) });

    return jsonResponse(updated);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return errorResponse("Gagal memperbarui data struktur organisasi", 500);
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(_req);

    const { id } = await params;
    await deleteOne(organizationStructures.collectionName, { id: Number(id) });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus data struktur organisasi", 500);
  }
};