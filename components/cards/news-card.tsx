import Link from "next/link";
import Image from "next/image";
import { findMany } from "@/lib/db/index";
import { news as newsSchema, categories as categoriesSchema, users as usersSchema } from "@/lib/db/schema";

async function loadLatestNews(limit = 3) {
  try {
    // find admin users (role_id === 1)
    const admins = await findMany(usersSchema.collectionName, { role_id: 1 }, { limit: 100 });
    const adminIds = (admins || []).map((u: any) => u.id).filter(Boolean);
    if (adminIds.length === 0) return [];

    const items = await findMany(
      newsSchema.collectionName,
      { status: "published", author_id: { $in: adminIds } },
      { sort: { published_at: -1, created_at: -1 }, limit }
    );

    return items;
  } catch (err) {
    console.error("Failed to load latest news:", err);
    return [];
  }
}

export default async function NewsCard() {
  const items = await loadLatestNews(3);

  // load category names for any category_id present
  let categoryMap: Record<string | number, string> = {};
  try {
    const categoryIds = Array.from(new Set(items.map((it: any) => it.category_id).filter(Boolean)));
    if (categoryIds.length > 0) {
      const cats = await findMany(categoriesSchema.collectionName, { id: { $in: categoryIds } }, { limit: 100 });
      categoryMap = Object.fromEntries((cats || []).map((c: any) => [c.id, c.name]));
    }
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  return (
    <section id="news" className="bg-white px-6 py-20 text-slate-950 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Berita Desa</p>
            <h2 className="mt-4 text-4xl font-semibold">Berita Terbaru</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/berita" className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Semua Berita
            </Link>
            <Link href="/berita" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Berita Populer
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.length === 0 ? (
            [1, 2, 3].map((i) => (
              <article key={i} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="mb-5 h-52 rounded-[1rem] bg-slate-900"></div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Berita Desa</p>
                <p className="mt-3 text-sm text-slate-500">-</p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">Tidak ada berita</h3>
                <p className="mt-4 text-slate-600">Belum ada berita yang dipublikasikan.</p>
              </article>
            ))
          ) : (
            items.map((item: any) => (
              <article key={item.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-2xl">
                {item.cover_image_url ? (
                  <div className="relative mb-5 h-52 w-full overflow-hidden rounded-[1rem] bg-slate-200">
                    <Image
                      src={item.cover_image_url}
                      alt={item.title}
                      fill
                      quality={100}
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="mb-5 h-52 rounded-[1rem] bg-slate-900" />
                )}

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">{item.category_id ? (categoryMap[item.category_id] ?? String(item.category_id)) : "Berita Desa"}</p>
                <p className="mt-3 text-sm text-slate-500">{item.published_at ? new Date(item.published_at).toLocaleDateString("id-ID") : "-"}</p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-4 text-slate-600 line-clamp-3">{item.summary}</p>
                <Link href={`/berita/${item.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  Baca Selengkapnya
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
