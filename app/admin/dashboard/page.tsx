export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { countDocuments, findMany } from "@/lib/db/index";
import { news, umkms, awards, organizationStructures, infographics, homepageContents, comments } from "@/lib/db/schema";
import { Home, Newspaper, Store, Award as AwardIcon, Network, Image as ImageIcon, MessageSquare, ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [publishedNews, umkmItems, awardItems, strukturItems, infographicCount, homepageCount, commentCount] = await Promise.all([
    findMany<{ id: number; title: string; published_at?: Date | null; created_at: Date; status: string }>(news.collectionName, { status: "published" }, { sort: { published_at: -1, created_at: -1 }, limit: 5 }),
    findMany<{ id: number }>(umkms.collectionName),
    findMany<{ id: number }>(awards.collectionName),
    findMany<{ id: number }>(organizationStructures.collectionName),
    countDocuments(infographics.collectionName),
    countDocuments(homepageContents.collectionName),
    countDocuments(comments.collectionName),
  ]);

  return {
    beritaCount: publishedNews.length,
    umkmCount: umkmItems.length,
    awardCount: awardItems.length,
    strukturCount: strukturItems.length,
    infographicCount,
    homepageCount,
    commentCount,
    latestNews: publishedNews.map((item) => ({
      id: item.id,
      title: item.title,
      publishedAt: item.published_at,
    })),
  };
}

const statConfig = [
  { key: "berita", label: "Berita", icon: Newspaper, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  { key: "umkm", label: "UMKM", icon: Store, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  { key: "award", label: "Penghargaan", icon: AwardIcon, color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  { key: "struktur", label: "Struktur Organisasi", icon: Network, color: "from-violet-500 to-violet-600", bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
  { key: "infografis", label: "Infografis", icon: ImageIcon, color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  { key: "homepage", label: "Beranda", icon: Home, color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-100" },
  { key: "comments", label: "Komentar", icon: MessageSquare, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
];

export default async function DashboardPage() {
  const { beritaCount, umkmCount, awardCount, strukturCount, infographicCount, homepageCount, commentCount, latestNews } = await getStats();

  const counts: Record<string, number> = {
    berita: beritaCount,
    umkm: umkmCount,
    award: awardCount,
    struktur: strukturCount,
    infografis: infographicCount,
    homepage: homepageCount,
    comments: commentCount,
  };

  const totalContent = beritaCount + umkmCount + awardCount + strukturCount + infographicCount + homepageCount + commentCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {/* Welcome */}
        <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 shadow-lg shadow-slate-900/10">
          {/* subtle decorative glow, doesn't touch the theme's palette */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard Admin
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Ringkasan Konten</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Statistik terbaru dari data website Desa Cijambe. Pantau berita, UMKM, penghargaan, dan konten lainnya di satu tempat.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Konten</p>
                <p className="mt-1 text-2xl font-bold text-white">{totalContent}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {statConfig.map(({ key, label, icon: Icon, color, bg, text, ring }) => (
            <article
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} ring-4 ring-transparent transition-all duration-200 group-hover:${ring}`}>
                <Icon className={`h-5 w-5 ${text}`} strokeWidth={2} />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-slate-500">{label}</p>
              <h2 className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{counts[key]}</h2>
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${color} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
            </article>
          ))}
        </section>

        {/* Latest news */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Berita Terbaru</h2>
              <p className="mt-1 text-sm text-slate-500">Aktivitas terakhir dari publikasi berita yang dipublikasikan.</p>
            </div>
            <Link
              href="/admin/berita"
              className="inline-flex items-center gap-1 self-start rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 sm:self-auto"
            >
              Lihat semua
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Newspaper className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">Belum ada berita yang dipublikasikan</p>
              <p className="mt-1 text-sm text-slate-400">Berita yang dipublikasikan akan muncul di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/berita/${item.id}/edit`}
                  className="group/card flex flex-col justify-between rounded-xl border border-slate-200 p-5 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
                >
                  <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover/card:text-blue-700">
                    {item.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Belum dipublikasikan"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}