"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Award, Calendar, Trophy, Building2 } from "lucide-react";
import Footer from "@/components/footer";

type AwardItem = {
  id: number;
  title: string;
  year: number;
  organizer: string;
  description?: string | null;
  photo_url?: string | null;
  order: number;
  is_active: boolean;
};

const ITEMS_PER_PAGE = 5;

export default function PenghargaanPage() {
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await fetch("/api/penghargaan?status=active", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Gagal memuat penghargaan: ${res.status}`);
        }
        const data = await res.json();
        setAwards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat penghargaan. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  const stats = useMemo(() => {
    if (awards.length === 0) {
      return {
        total: 0,
        latestYear: "-",
        organizerCount: 0,
      };
    }

    const latestYear = Math.max(...awards.map((award) => award.year));
    const organizerCount = new Set(awards.map((award) => award.organizer || "")).size;

    return {
      total: awards.length,
      latestYear,
      organizerCount,
    };
  }, [awards]);

  const pageCount = Math.max(1, Math.ceil(awards.length / ITEMS_PER_PAGE));
  const paginatedAwards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return awards.slice(start, start + ITEMS_PER_PAGE);
  }, [awards, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO SECTION */}
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
            <span className="h-px w-8 bg-emerald-500" /> Penghargaan Desa <span className="h-px w-8 bg-emerald-500" />
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Prestasi dan Penghargaan Desa Cijambe
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
            Prestasi dan penghargaan yang telah diraih Desa Cijambe sebagai bukti komitmen dalam pembangunan berkelanjutan.
          </motion.p>
        </motion.div>
      </section>

      {/* DAFTAR PENGHARGAAN */}
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
              <span className="h-px w-8 bg-emerald-400" /> Daftar Penghargaan <span className="h-px w-8 bg-emerald-400" />
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Penghargaan yang Telah Diraih
            </h2>
          </motion.div>

          {/* TABLE - Responsive untuk mobile */}
          {loading ? (
            <div className="mt-12 rounded-[1.5rem] border border-emerald-200 bg-white px-8 py-16 text-center text-slate-700 shadow-lg">
              Memuat daftar penghargaan...
            </div>
          ) : error ? (
            <div className="mt-12 rounded-[1.5rem] border border-red-200 bg-red-50 px-8 py-16 text-center text-red-700 shadow-lg">
              {error}
            </div>
          ) : awards.length === 0 ? (
            <div className="mt-12 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-8 py-16 text-center text-emerald-700 shadow-lg">
              Belum ada penghargaan yang tersedia.
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-12 overflow-x-auto rounded-[1.5rem] border border-emerald-200 bg-white shadow-lg"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-emerald-700 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                            #
                          </span>
                          NO.
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-emerald-700 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          NAMA PENGHARGAAN
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-emerald-700 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          PENYELENGGARA
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-emerald-700 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          TAHUN
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {paginatedAwards.map((award, index) => (
                      <motion.tr
                        key={award.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                        className="hover:bg-emerald-50/50 transition-colors"
                      >
                        <td className="px-4 py-5 text-center sm:px-6">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-5 sm:px-6">
                          <p className="text-sm font-medium text-slate-900">{award.title}</p>
                        </td>
                        <td className="px-4 py-5 sm:px-6">
                          <p className="text-sm text-slate-700">{award.organizer}</p>
                        </td>
                        <td className="px-4 py-5 sm:px-6">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                            <Calendar className="h-3 w-3" />
                            {award.year}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-[1.5rem] border-x border-b border-emerald-200 bg-emerald-50 px-6 py-5 text-slate-700 sm:px-8">
                <p className="text-sm text-slate-700">
                  Halaman {currentPage} dari {pageCount}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index + 1}
                      type="button"
                      onClick={() => handlePageChange(index + 1)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        currentPage === index + 1
                          ? "bg-emerald-700 text-white"
                          : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SUMMARY STATS */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                <Award className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="mt-4 text-3xl font-bold text-emerald-700">{stats.total}</p>
              <p className="mt-2 text-sm font-medium text-emerald-600">Total Penghargaan</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
              className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                <Trophy className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="mt-4 text-3xl font-bold text-emerald-700">{stats.latestYear}</p>
              <p className="mt-2 text-sm font-medium text-emerald-600">Tahun Terakhir</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
              className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                <Building2 className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="mt-4 text-3xl font-bold text-emerald-700">{stats.organizerCount}</p>
              <p className="mt-2 text-sm font-medium text-emerald-600">Lembaga Pemberi</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENT HIGHLIGHT */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(16,185,129,0.6) 0px, rgba(16,185,129,0.6) 1px, transparent 1px, transparent 64px)",
          }}
        />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
              <span className="h-px w-8 bg-emerald-500" /> Komitmen Kami <span className="h-px w-8 bg-emerald-500" />
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Terus Berinovasi untuk Kemajuan Desa
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Setiap penghargaan yang diraih adalah hasil kerja keras dan dedikasi seluruh masyarakat Desa Cijambe dalam mewujudkan pembangunan berkelanjutan dan meningkatkan kesejahteraan bersama.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/5 p-8 backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
                <Award className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Program Bermanfaat</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Komitmen terhadap program-program yang memberikan dampak nyata bagi masyarakat dan lingkungan.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/5 p-8 backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Berkelanjutan</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Terus berinovasi dan meningkatkan kualitas layanan untuk mencapai pembangunan yang berkelanjutan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
