"use client";

import { motion, useInView, animate } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  GraduationCap,
  Grid3x3,
  HeartPulse,
  Home as HomeIcon,
  LayoutGrid,
  LayoutTemplate,
  Leaf,
  MapPinned,
  Palette,
  Type,
  TrendingUp,
  Users2,
} from "lucide-react";
import Footer from "@/components/footer";

/* ---------------------------------------------------------
   Angka berjalan (count-up) — dipicu saat elemen masuk layar
--------------------------------------------------------- */
function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplay(
          latest.toLocaleString("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        );
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

type InfografisItem = {
  id: number;
  title: string;
  value: string | number;
  unit?: string | null;
  icon?: string | React.ComponentType<{ className?: string }> | null;
  order: number;
  decimals?: number;
  suffix?: string;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users2,
  home: HomeIcon,
  "layout-grid": LayoutGrid,
  "grid-3x3": Grid3x3,
  "map-pinned": MapPinned,
  "trending-up": TrendingUp,
  "heart-pulse": HeartPulse,
  leaf: Leaf,
  palette: Palette,
  award: Award,
  "layout-template": LayoutTemplate,
  type: Type,
};

const fallbackStats: InfografisItem[] = [
  { id: 1, order: 1, icon: Users2, title: "Jumlah Penduduk", value: 6200, decimals: 0, suffix: "" },
  { id: 2, order: 2, icon: HomeIcon, title: "Jumlah KK", value: 1450, decimals: 0, suffix: "" },
  { id: 3, order: 3, icon: LayoutGrid, title: "Jumlah RW", value: 14, decimals: 0, suffix: "" },
  { id: 4, order: 4, icon: Grid3x3, title: "Jumlah RT", value: 58, decimals: 0, suffix: "" },
  { id: 5, order: 5, icon: MapPinned, title: "Luas Wilayah", value: 12.4, decimals: 1, suffix: " km²" },
];

const focusAreas = [
  {
    icon: GraduationCap,
    title: "Pendidikan",
    description: "Meningkatkan kualitas pendidikan dan fasilitas belajar di desa.",
  },
  {
    icon: TrendingUp,
    title: "Ekonomi",
    description: "Menguatkan pelaku UMKM dan pengembangan BUMDES untuk kemandirian.",
  },
  {
    icon: HeartPulse,
    title: "Kesehatan",
    description: "Memperkuat pelayanan kesehatan dan akses sanitasi masyarakat.",
  },
  {
    icon: Leaf,
    title: "Lingkungan",
    description: "Menjaga kelestarian alam, kebersihan, dan ruang terbuka hijau.",
  },
];

const highlightTema = [
  {
    icon: Palette,
    title: "Palet Warna",
    desc: "Warna hijau emerald, putih, dan abu-abu lembut menciptakan nuansa formal sekaligus hangat.",
  },
  {
    icon: Type,
    title: "Tipografi",
    desc: "Font yang jelas dengan ukuran kontras memudahkan pembacaan untuk semua usia.",
  },
  {
    icon: LayoutTemplate,
    title: "Gaya Layout",
    desc: "Kartu, grid, dan bayangan ringan menjaga tampilan tetap modern dan rapi.",
  },
];

export default function InfografisPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<InfografisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/infografis?status=active", { cache: "no-store" });
        if (!res.ok) throw new Error(`Gagal memuat data (${res.status})`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data infografis. Pastikan koneksi dan data tersedia.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = items.length > 0 ? items : fallbackStats;
  const hasLoadedItems = !loading && items.length > 0;

  return (
    <>
      {/* Global header provided by components/Header.tsx */}

      <main className="bg-slate-950 text-white">
        {/* HERO — gambar latar + overlay gelap, selaras dengan hero halaman utama */}
        <section
          ref={heroRef}
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
              <span className="h-px w-8 bg-emerald-500" /> Infografis Desa <span className="h-px w-8 bg-emerald-500" />
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Data dan Fokus Pembangunan Desa Cijambe
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
              Menyajikan data ringkas, fokus pembangunan, dan capaian Desa Cijambe dalam satu halaman informatif.
            </motion.p>
          </motion.div>
        </section>

        {/* STATISTIK — count-up, senada dengan section Sosial Ekonomi */}
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
                <span className="h-px w-8 bg-emerald-400" /> Data Desa <span className="h-px w-8 bg-emerald-400" />
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Gambaran Singkat Desa Cijambe
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {stats.map((item, i) => {
                const iconKey = typeof item.icon === "string" ? item.icon.toLowerCase() : "";
                const Icon = typeof item.icon === "string" ? iconMap[iconKey] ?? Users2 : item.icon ?? Users2;
                const parsedValue = Number(String(item.value).replace(/[^0-9.,-]/g, ""));
                const isNumeric = Number.isFinite(parsedValue);
                const suffix = item.suffix ?? (item.unit ? ` ${item.unit}` : "");

                return (
                  <motion.div
                    key={`${item.title}-${item.order}-${i}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                    className="group rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">{item.title}</p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
                      {isNumeric ? (
                        <CountUp value={parsedValue} decimals={Number.isInteger(parsedValue) ? 0 : 1} suffix={suffix} />
                      ) : (
                        <>{String(item.value)}{item.unit ? ` ${item.unit}` : ""}</>
                      )}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOKUS PROGRAM — kembali gelap, senada dengan Sosial Ekonomi */}
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
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">
                  <span className="h-px w-8 bg-emerald-500" /> Fokus Program
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Prioritas Pembangunan Desa</h2>
              </div>
              <Link
                href="/"
                className="inline-flex w-fit items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Kembali ke Beranda
              </Link>
            </motion.div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {focusAreas.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* INFO SINGKAT + HIGHLIGHT TEMA */}
        <section className="relative overflow-hidden bg-white px-6 py-24 text-slate-950 sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col justify-center rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Info Singkat</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 text-justify">
                Halaman Infografis ini dibuat untuk menampilkan gambaran cepat tentang kondisi dan prioritas Desa
                Cijambe. Tema dan warna mengikuti gaya situs utama agar pengalaman pengunjung tetap konsisten.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlightTema.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}