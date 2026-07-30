import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { infographics } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/apiHelpers";
import { sanitizeText } from "@/lib/server/validation";
import { parseBooleanField, parseNumberField, parseRequestBody, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const item = await findOne(infographics.collectionName, { id: Number(id) });

    if (!item) {
      return errorResponse("Infografis tidak ditemukan", 404);
    }

    return jsonResponse(item);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memuat infografis", 500);
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const body = await parseRequestBody(req);

    const data: Record<string, unknown> = {
      title: sanitizeText(body.title),
      value: sanitizeText(body.value),
      unit: sanitizeText(body.unit),
      icon: sanitizeText(body.icon),
    };

    const orderValue = parseNumberField(body.order, undefined as any);
    if (orderValue !== undefined) {
      data.order = orderValue;
    }

    if (body.isActive !== undefined) {
      data.is_active = parseBooleanField(body.isActive);
    }

    await updateOne(infographics.collectionName, { id: Number(id) }, data);
    const updated = await findOne(infographics.collectionName, { id: Number(id) });

    return jsonResponse(updated);
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal memperbarui infografis", 500);
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(_req);

    const { id } = await params;
    await deleteOne(infographics.collectionName, { id: Number(id) });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus infografis", 500);
  }
};