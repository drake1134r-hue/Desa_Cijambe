import { getServerSession } from "next-auth";
import { requireAuthSession, requireAdmin } from "@/lib/server/apiHelpers";
import { findOne, updateOne, deleteOne } from "@/lib/db/index";
import { news } from "@/lib/db/schema";
import { parseRequestBody, parseFileField } from "@/lib/server/apiHelpers";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const article = await findOne(news.collectionName, { id: Number(id) });

    if (!article) {
      return new Response(
        JSON.stringify({ error: "News not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error fetching news:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
      status: 500,
    });
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: routeId } = await params;
    // prefer requireAuthSession which reads JWT from the request (works with multipart)
    const session = await requireAuthSession(req);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const id = Number(routeId);
    const body = await parseRequestBody(req);
    const {
      title,
      summary,
      content,
      categoryId,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      tags,
    } = body;

    // process uploaded file field (if provided)
    let coverImageUrl: string | undefined = undefined;
    try {
      const uploaded = await parseFileField(body.coverImageUrl, "berita");
      if (uploaded) {
        coverImageUrl = uploaded;
      } else if (typeof body.coverImageUrl === "string" && body.coverImageUrl.trim() !== "") {
        coverImageUrl = body.coverImageUrl;
      }
    } catch (err) {
      console.error("Failed to process uploaded file:", err);
      return new Response(JSON.stringify({ error: "Invalid uploaded file" }), { status: 400 });
    }

    const article = await findOne(news.collectionName, { id });

    if (!article) {
      return new Response(
        JSON.stringify({ error: "News not found" }),
        { status: 404 }
      );
    }

    const role = (session.user as any).role;
    const isAdmin = role === 1 || role === "1";
    const userId = String((session.user as any).id ?? "");
    const isOwner = String(article.author_id) === userId;
    console.log("PUT /api/berita/[id] session.user:", session.user);
    console.log("PUT /api/berita/[id] article.author_id:", article.author_id);
    if (!isOwner && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    let slug = article.slug;
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
    }

    // determine published_at: if setting to published and there was no published_at, set now
    let newPublishedAt = article.published_at;
    if (status === "published" && !article.published_at) {
      newPublishedAt = new Date().toISOString();
    }

    await updateOne(news.collectionName, { id }, {
      title: title || article.title,
      slug,
      summary: summary || article.summary,
      content: content || article.content,
      category_id: categoryId !== undefined ? categoryId : article.category_id,
      cover_image_url: coverImageUrl !== undefined ? coverImageUrl : article.cover_image_url,
      status: status || article.status,
      is_featured: isFeatured !== undefined ? isFeatured : article.is_featured,
      seo_title: seoTitle || article.seo_title,
      seo_description: seoDescription || article.seo_description,
      tags: tags || article.tags,
      published_at: newPublishedAt,
    });

    const updatedNews = await findOne(news.collectionName, { id });

    return new Response(JSON.stringify({ success: true, data: updatedNews }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error updating news:", error);
    return new Response(JSON.stringify({ error: "Failed to update news" }), {
      status: 500,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: routeId } = await params;
    await requireAdmin(req);

    const id = Number(routeId);
    const article = await findOne(news.collectionName, { id });

    if (!article) {
      return new Response(
        JSON.stringify({ error: "News not found" }),
        { status: 404 }
      );
    }

    await deleteOne(news.collectionName, { id });

    return new Response(
      JSON.stringify({ success: true, message: "News deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error deleting news:", error);
    return new Response(JSON.stringify({ error: "Failed to delete news" }), {
      status: 500,
    });
  }
};
