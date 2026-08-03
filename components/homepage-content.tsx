"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownCircle, MapPin, Phone, Clock, Megaphone, Quote, CheckCircle2, Users2 } from "lucide-react";

const stats = [
  { label: "Jumlah Penduduk", value: "6.200" },
  { label: "Jumlah KK", value: "1.450" },
  { label: "Jumlah RW", value: "14" },
  { label: "Jumlah RT", value: "58" },
  { label: "Luas Wilayah", value: "12.4 km²" },
];

const infoCards = [
  { icon: MapPin, label: "Alamat", title: "Desa Cijambe", desc: "Kecamatan Paseh, Kabupaten Sumedang" },
  { icon: Phone, label: "Kontak", title: "WhatsApp", desc: "+62 851-6810-2868" },
  { icon: Clock, label: "Jam Pelayanan", title: "Senin – Kamis", desc: "08.00 – 16.00 WIB" },
  { icon: Megaphone, label: "Slogan", title: "AMMAN BERKAT", desc: "Agamis • Maju • Mandiri • Berbasis Masyarakat" },
];

type HomepageSection = {
  id: number;
  key: string;
  label: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  extra?: string | null;
  order: number;
  is_active: boolean;
};

export default function HomepageContent() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/homepage-contents?status=active");
        if (!res.ok) throw new Error("Failed to load homepage content");
        const data = await res.json();
        setSections(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  function getSection(key: string) {
    return sections.find((section) => section.key === key);
  }

  function parseList(extra?: string | null) {
    if (!extra) return [];
    return extra
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const vision = getSection("vision");
  const mission = getSection("mission");
  const greeting = getSection("greeting");
  const about = getSection("about");
  const hasHomepageData = Boolean(vision || mission || greeting || about);

  const missionItems = mission ? parseList(mission.extra) : [];

  const aboutTitle = about?.title ?? "";
  const aboutContent = about?.content ?? "";

  return (
    <>
      <section
        id="home"
        className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/30 to-slate-950/70" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-24 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8"
          >
            <p className="inline-flex items-center justify-center gap-3 rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-emerald-100">
              <MapPin className="h-4 w-4" /> Desa Cijambe • Paseh • Sumedang
            </p>
            <div className="space-y-6">
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                DESA CIJAMBE
              </h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mx-auto h-24 w-24 overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 shadow-lg shadow-emerald-950/20 sm:h-28 sm:w-28"
              >
                <Image
                  src="/images/desa.png"
                  alt="Logo Desa Cijambe"
                  width={190}
                  height={190}
                  className="h-full w-full object-contain p-2"
                />
              </motion.div>
              <p className="mx-auto max-w-2xl text-xl leading-9 text-emerald-100/90 md:text-2xl">
                SUMEDANG TANDANG NYANDANG KAHAYANG
              </p>
              <p className="mx-auto max-w-2xl text-base leading-7 text-emerald-100/70 sm:text-lg">
                Desa Cijambe yang Agamis, Maju, Mandiri, dan Berbasis Masyarakat. Portal resmi Pemerintah Desa Cijambe yang menyediakan informasi publik mengenai potensi, pembangunan, dan kegiatan Desa Cijambe.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#about"
                className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Jelajahi Desa
              </Link>
              <Link
                href="#map"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Temukan Lokasi
              </Link>
              <Link
                href="#comments"
                className="rounded-full border border-emerald-300/40 bg-emerald-100/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Beri Masukkan Desa
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
          <motion.div animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDownCircle className="h-12 w-12 text-white/80" />
          </motion.div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-white px-6 py-24 text-slate-950 sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
              <span className="h-px w-8 bg-emerald-400" /> Tentang Desa <span className="h-px w-8 bg-emerald-400" />
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {aboutTitle}
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              {aboutContent}
            </p>
          </motion.div>

          {hasHomepageData ? (
            <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Visi</p>
                {vision ? (
                  <>
                    <p className="mt-4 text-lg font-semibold text-emerald-700">{vision.title}</p>
                    <p className="mt-1 text-sm italic leading-7 text-slate-600">{vision.subtitle}</p>
                    <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{vision.content}</p>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-600">Konten visi belum tersedia. Tambahkan data di admin.</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="flex flex-col rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Misi Desa</p>
                {mission ? (
                  <>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Upaya-upaya yang dilaksanakan untuk mewujudkan visi, dijabarkan ke dalam program kerja dan pedoman
                      pembangunan desa.
                    </p>
                    <ul className="mt-5 space-y-3">
                      {missionItems.length > 0 ? missionItems.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      )) : (
                        <li className="text-sm leading-7 text-slate-600">Konten misi belum tersedia. Tambahkan data di admin.</li>
                      )}
                    </ul>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-600">Konten misi belum tersedia. Tambahkan data di admin.</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm"
              >
                <Quote className="absolute -right-4 -top-4 h-28 w-28 text-emerald-500/10" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Sambutan</p>
                  {greeting ? (
                    <>
                      <h3 className="mt-3 text-xl font-semibold">{greeting.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-300">{greeting.content}</p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-slate-300">Konten sambutan belum tersedia. Tambahkan data di admin.</p>
                  )}
                </div>
                <div className="relative mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Kepala Desa</p>
                    <p className="text-xs text-slate-400">Pemerintah Desa Cijambe</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-600 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Konten Beranda Kosong</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Tambahkan konten beranda dari panel admin</h3>
              <p className="mt-3 max-w-2xl mx-auto text-sm leading-7">
                Sekarang tidak ada data visi, misi, sambutan, atau tentang desa yang aktif di database. Silakan masukkan data di admin Supabase atau melalui panel admin agar konten tampil di halaman utama.
              </p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map(({ icon: Icon, label, title, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
