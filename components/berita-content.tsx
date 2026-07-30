"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Newspaper, ArrowRight, CalendarDays } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type NewsItem = {
  id: string | number;
  slug: string;
  title: string;
  summary?: string | null;
  cover_image_url?: string | null;
  published_at?: string | Date | null;
};

export default function BeritaContent({ news, page = 1, pageSize = 9, total = 0 }: { news: NewsItem[]; page?: number; pageSize?: number; total?: number }) {
  const router = useRouter();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (targetPage: number) => {
    router.push(`/berita?page=${targetPage}`);
  };

  return (
    <>
      {/* HERO — gambar latar + overlay gelap, selaras dengan halaman lain */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed px-6 pb-24 pt-40 text-white sm:px-12"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(16,185,129,0.6) 0px, rgba(16,185,129,0.6) 1px, transparent 1px, transparent 64px)",
          }}
        />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
            <span className="h-px w-8 bg-emerald-500" /> Informasi Terkini <span className="h-px w-8 bg-emerald-500" />
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Berita Desa Cijambe
          </h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="mx-auto mt-6 h-20 w-20 overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 shadow-lg shadow-emerald-950/20 sm:h-24 sm:w-24"
          >
            <Image
              src="/images/desa.png"
              alt="Logo Desa Cijambe"
              width={96}
              height={96}
              className="h-full w-full object-contain p-2"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            Ikuti perkembangan dan informasi terbaru dari Desa Cijambe.
          </motion.p>
        </motion.div>
      </section>

      {/* DAFTAR BERITA */}
      <section className="relative overflow-hidden bg-white px-6 py-24 text-slate-950 sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
              <span className="h-px w-8 bg-emerald-400" /> Kabar Desa <span className="h-px w-8 bg-emerald-400" />
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Berita & Pengumuman Terbaru
            </h2>
          </motion.div>

          <div className="mt-12">
            {news.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-16 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Newspaper className="h-6 w-6" />
                </span>
                <p className="text-slate-500">Belum ada berita yang dipublikasikan.</p>
              </motion.div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: (i % 6) * 0.08 }}
                  >
                    <Link
                      href={`/berita/${item.slug}`}
                      className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                    >
                      {item.cover_image_url && (
                        <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                          <Image
                            src={item.cover_image_url}
                            alt={item.title}
                            fill
                            quality={100}
                            unoptimized
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="p-6">
                        <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-emerald-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString("id-ID")
                            : "Unpublished"}
                        </p>
                        <h3 className="mt-3 line-clamp-2 text-xl font-semibold text-slate-950">{item.title}</h3>
                        <p className="mt-3 line-clamp-2 text-slate-600">{item.summary}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 transition group-hover:gap-3">
                          Baca Selengkapnya
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          {total > pageSize && (
            <Pagination page={page} pageCount={pageCount} onPageChange={handlePageChange} />
          )}
        </div>
      </section>
    </>
  );
}