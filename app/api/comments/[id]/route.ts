import { deleteOne, findOne } from "@/lib/db/index";
import { comments } from "@/lib/db/schema";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const commentId = Number(id);

    const existing = await findOne(comments.collectionName, { id: commentId });
    if (!existing) {
      return errorResponse("Komentar tidak ditemukan", 404);
    }

    await deleteOne(comments.collectionName, { id: commentId });
    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal menghapus komentar", 500);
  }
};
