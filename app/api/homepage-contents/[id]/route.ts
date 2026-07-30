import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { homepageContents } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText, sanitizeContent } from "@/lib/server/validation";
import { parseBooleanField, parseNumberField, parseRequestBody, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const item = await findOne(homepageContents.collectionName, { id: Number(id) });
    if (!item) {
      return errorResponse("Konten beranda tidak ditemukan", 404);
    }
    return jsonResponse(item);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat konten beranda", 500);
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await parseRequestBody(req);

    const data: Record<string, unknown> = {
      key: sanitizeText(body.key),
      label: sanitizeText(body.label),
      title: sanitizeText(body.title),
      subtitle: sanitizeText(body.subtitle),
      content: sanitizeContent(body.content),
      extra: sanitizeContent(body.extra),
    };

    const orderValue = parseNumberField(body.order, undefined as any);
    if (orderValue !== undefined) {
      data.order = orderValue;
    }
    if (body.isActive !== undefined) {
      data.is_active = parseBooleanField(body.isActive);
    }

    await updateOne(homepageContents.collectionName, { id: Number(id) }, data);
    const updated = await findOne(homepageContents.collectionName, { id: Number(id) });
    return jsonResponse(updated);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memperbarui konten beranda", 500);
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(_req);
    const { id } = await params;
    await deleteOne(homepageContents.collectionName, { id: Number(id) });
    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus konten beranda", 500);
  }
};
