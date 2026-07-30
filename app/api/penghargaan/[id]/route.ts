import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { awards } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseFileField, parseNumberField, parseRequestBody, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const item = await findOne(awards.collectionName, { id: Number(id) });

    if (!item) {
      return errorResponse("Penghargaan tidak ditemukan", 404);
    }

    return jsonResponse(item);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat penghargaan", 500);
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const body = await parseRequestBody(req);
    const photoUrl = await parseFileField(body.photo, "penghargaan");

    const data: Record<string, unknown> = {
      title: sanitizeText(body.title),
      year: parseNumberField(body.year, undefined as any),
      organizer: sanitizeText(body.organizer),
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

    await updateOne(awards.collectionName, { id: Number(id) }, data);
    const updated = await findOne(awards.collectionName, { id: Number(id) });

    return jsonResponse(updated);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memperbarui penghargaan", 500);
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(_req);

    const { id } = await params;
    await deleteOne(awards.collectionName, { id: Number(id) });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus penghargaan", 500);
  }
};