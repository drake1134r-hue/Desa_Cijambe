import { deleteOne, findOne, updateOne } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { parseBooleanField, parseRequestBody, requireAdmin, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";
import { sanitizeText } from "@/lib/server/validation";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const user = await findOne(users.collectionName, { id: Number(id), role_id: 1 });

    if (!user) {
      return errorResponse("Admin tidak ditemukan", 404);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
    };

    return jsonResponse(safeUser, 200);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof Response) return error;
    return errorResponse("Gagal memuat admin", 500);
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await parseRequestBody(req);

    const data: Record<string, unknown> = {
      name: sanitizeText(body.name),
      username: sanitizeText(body.username),
      email: sanitizeText(body.email),
      phone: sanitizeText(body.phone),
      is_active: parseBooleanField(body.isActive),
    };

    if (typeof body.password === "string" && body.password.trim()) {
      const { hash } = await import("bcryptjs");
      data.password_hash = await hash(body.password.trim(), 10);
    }

    await updateOne(users.collectionName, { id: Number(id), role_id: 1 }, data);
    const updated = await findOne(users.collectionName, { id: Number(id), role_id: 1 });
    return jsonResponse(updated, 200);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Response) return error;
    return errorResponse("Gagal memperbarui admin", 500);
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await deleteOne(users.collectionName, { id: Number(id), role_id: 1 });
    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Response) return error;
    return errorResponse("Gagal menghapus admin", 500);
  }
};
