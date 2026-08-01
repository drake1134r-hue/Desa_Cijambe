import { findMany, findOne, insertOne } from "@/lib/db/index";
import { news } from "@/lib/db/schema";
import { parseRequestUrl, requireAdmin, requireAuthSession, parseRequestBody, parseFileField } from "@/lib/server/apiHelpers";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = parseRequestUrl(req);
    const slug = searchParams.get("slug");
    const status = searchParams.get("status");

    if (slug) {
      const result = await findOne(news.collectionName, { slug });

      if (!result) {
        return new Response(
          JSON.stringify({ error: "News not found" }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await requireAuthSession(req);
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 1 || userRole === "1";
    const statusFilter = isAdmin ? (status || "all") : (status || "published");

    const filter: Record<string, unknown> = { status: { $ne: "deleted" } };
    if (!isAdmin) {
      filter.status = statusFilter;
    } else if (statusFilter !== "all") {
      filter.status = statusFilter;
    }

    const allNews = await findMany(news.collectionName, filter, {
      sort: { published_at: -1, created_at: -1 },
      limit: 100,
    });

    return new Response(JSON.stringify(allNews), {
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

export const POST = async (req: Request) => {
  try {
    const session = await requireAdmin(req);

    const body = await parseRequestBody(req);
    const { title, summary, content, categoryId, status } = body;
    // handle file upload if present
    let coverImageUrl: string | null = null;
    try {
      const uploaded = await parseFileField(body.coverImageUrl, "berita");
      if (uploaded) {
        coverImageUrl = uploaded;
      } else if (typeof body.coverImageUrl === "string") {
        coverImageUrl = body.coverImageUrl.trim() || null;
      }
    } catch (err) {
      console.error("Failed to save uploaded cover image:", err);
      return new Response(JSON.stringify({ error: "Invalid uploaded file" }), { status: 400 });
    }

    if (!title || !summary || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const now = new Date().toISOString();
    const result = await insertOne(news.collectionName, {
      title,
      slug,
      summary,
      content,
      category_id: categoryId || null,
      author_id: parseInt(userId),
      cover_image_url: coverImageUrl || null,
      status: status || "draft",
      published_at: status === "published" ? now : null,
    });

    const insertedNews = await findOne(news.collectionName, { id: result.id });

    return new Response(
      JSON.stringify({ success: true, id: insertedNews?.id }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Error creating news:", error);
    return new Response(JSON.stringify({ error: "Failed to create news" }), {
      status: 500,
    });
  }
};
