import { findMany, countDocuments } from "@/lib/db/index";
import { news } from "@/lib/db/schema";

type NewsItem = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  cover_image_url?: string | null;
  published_at?: string | Date | null;
};
import Footer from "@/components/footer";
import BeritaContent from "@/components/berita-content";

async function getPublishedNews(page = 1, pageSize = 9) {
  try {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      findMany<NewsItem>(news.collectionName, { status: "published" }, { sort: { published_at: -1 }, skip, limit: pageSize }),
      countDocuments(news.collectionName, { status: "published" }),
    ]);
    return { items, total };
  } catch (error) {
    console.error("Error fetching news:", error);
    return { items: [], total: 0 };
  }
}

export default async function BeritaPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const pageSize = 9;
  const { items, total } = await getPublishedNews(page, pageSize);

  return (
    <>
      <main className="min-h-screen bg-slate-950">
        <BeritaContent news={items} page={page} pageSize={pageSize} total={total} />
      </main>

      <Footer />
    </>
  );
}