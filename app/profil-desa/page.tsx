"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  BookOpen,
  Landmark,
  CalendarClock,
  MapPinned,
  ScrollText,
  Users2,
} from "lucide-react";
import Footer from "@/components/footer";

const JOURNEY = [
  { place: "Majalengka", note: "Titik berangkat Buyut Lidah" },
  { place: "Bantar Jambe", note: "Menetap bersama Nyi Mas Emed" },
  { place: "Situraja", note: "Arah timur dari Bantar Jambe" },
  { place: "Malaka", note: "Menuju utara" },
  { place: "Cikekes", note: "Melanjutkan perjalanan" },
  { place: "Samoja", note: "Melanjutkan perjalanan" },
  { place: "Parugpug", note: "Menyeberang ke barat" },
  { place: "Cijambe", note: "Kampung babakan, tempat menetap", isDestination: true },
];

const TIMELINE = [
  {
    year: "1980",
    label: "PP No. 38 Tahun 1980",
    detail: "Kecamatan Paseh resmi dibentuk 5 November 1980, terdiri dari 4 desa: Bongkok, Paseh, Legok, dan Cijambe.",
  },
  {
    year: "1982",
    label: "Pemekaran Desa",
    detail: "Desa Cijambe dimekarkan menjadi dua desa: Desa Cijambe dan Desa Pasireungit.",
  },
];

const FAKTA = [
  ["Asal nama", "Bantar Jambe"],
  ["Kecamatan", "Paseh, Sumedang"],
  ["Terbentuk", "Bagian Kec. Paseh sejak 1980"],
  ["Status", "Berdiri sebelum pemekaran 1982"],
];

export default function ProfilDesaPage() {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <>
      {/* Global header provided by components/Header.tsx */}

      <main className="bg-slate-950 text-white">
        {/* HERO — selaras dengan hero halaman utama: gelap, bertekstur, animasi masuk */}
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
              <span className="h-px w-8 bg-emerald-500" /> Sejarah Desa <span className="h-px w-8 bg-emerald-500" />
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Legenda dan Sejarah Desa Cijambe
            </h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mx-auto mt-8 h-28 w-28 overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-inner shadow-slate-950/30"
            >
              <Image
                src="/images/desa.png"
                alt="Lambang Desa Cijambe"
                width={112}
                height={112}
                className="object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-sm sm:p-8"
            >
              <p className="text-base leading-8 text-slate-300 sm:text-lg text-center">
                Menyajikan ringkasan legenda, asal-usul nama, dan sejarah pendek Desa Cijambe dalam balutan tata letak
                modern yang mudah dibaca.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* LEGENDA + JEJAK PERJALANAN */}
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative mx-auto max-w-6xl rounded-[2rem] border border-emerald-100 bg-white p-10 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
                  <span className="h-px w-8 bg-emerald-400" /> Sasakala
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">Legenda Nama Cijambe</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-inner shadow-emerald-950/10">
                <ScrollText className="h-4 w-4" /> Cerita Lokal
              </div>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
              {/* Jejak perjalanan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="rounded-[1.75rem] bg-emerald-50 p-6 shadow-sm"
              >
                <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  <MapPinned className="h-3.5 w-3.5" /> Jejak Perjalanan
                </p>
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-emerald-300" />
                  <ol className="space-y-6">
                    {JOURNEY.map((stop, i) => (
                      <motion.li
                        key={stop.place}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
                        className="relative"
                      >
                        <span
                          className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 ${
                            stop.isDestination
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-emerald-400 bg-white"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            stop.isDestination ? "text-emerald-700" : "text-slate-950"
                          }`}
                        >
                          {stop.place}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-600">{stop.note}</p>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.div>

              {/* Narasi */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="space-y-4 text-slate-700 leading-8 text-justify"
              >
                <p>
                  Berdasarkan cerita turun-temurun orang tua di Cijambe, Buyut Lidah memiliki nama asli Lidah Suryanegara,
                  keturunan dalem (Bupati) Majalengka. Beliau pergi dari Majalengka tahun dan sebabnya tidak diketahui.
                  Buyut Lidah pergi dari Majalengka ditemani oleh putrinya yang konon sangat cantik jelita bernama Nyi Mas
                  Emed dan lebih dikenal dengan nama Buyut Emed, serta didampingi pengiring/pengawal (dalam istilah
                  pewayangan dikenal dengan panakawan).
                </p>
                <p>
                  Buyut Lidah sampai di daerah atau kampung Bantar Jambe, tepatnya sebelah timur Situraja. Beliau dan
                  putrinya tinggal dan menetap di Bantar Jambe. Dalam mengisi waktu luangnya, Buyut Lidah sering
                  berkeliling sekitar wilayah Bantar Jambe dan sekali waktu beliau pergi dari Bantar Jambe ke arah Situraja
                  lalu ke utara menuju Malaka, Cikekes, Samoja, menyebrang ke Parugpug, dan lanjut ke sebelah barat sampai
                  suatu kampung (babakan). Beliau istirahat dan tinggal di kampung tersebut beberapa hari.
                </p>
                <p>
                  Berawal dari perjalanan tersebut, Buyut Lidah mulai tertarik dan merasa kerasan tinggal di kampung
                  babakan di sebelah barat Parugpug. Seiring waktu, beliau sering bolak-balik antara Bantar Jambe dan
                  kampung babakan tersebut. Suatu waktu musim kemarau, Buyut Lidah pergi dari Bantar Jambe sekitar jam
                  17.00 melewati kumpulan penduduk yang sedang ngobrol di teras rumah (dalam istilah Sunda tempat tersebut
                  dikenal dengan sebutan &ldquo;bale atau tepas&rdquo; yaitu tempat berkumpulnya keluarga/masyarakat pagi atau sore
                  hari). Salah satu penduduk bertanya: &ldquo;Siapakah orang tersebut? Perasaan kerap lewat ke sini dan menuju ke
                  kampung babakan. Darimana dia berasal?&rdquo; Dijawab temannya: &ldquo;Dia itu orang Bantar Jambe&rdquo;. Maka sejak itu
                  kampung babakan sebelah barat Parugpug dikenal dengan sebutan{" "}
                  <span className="font-semibold text-slate-950">CIJAMBE</span>.
                </p>
                <p>
                  Buyut Lidah akhirnya tinggal di Cijambe karena lingkungan dan wilayah di sekitar Cijambe dirasakan cocok
                  sebagai tempat tinggal beliau dan keluarganya.
                </p>
              </motion.article>
            </div>
          </motion.div>
        </section>

        {/* SEJARAH DESA + FAKTA SINGKAT — kembali ke nuansa gelap seperti bagian sosial-ekonomi */}
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

          <div className="relative mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Riwayat</p>
                  <h2 className="text-2xl font-semibold text-white">Sejarah Desa</h2>
                </div>
              </div>

              <p className="mt-6 text-slate-300 leading-8 text-justify">
                Desa Cijambe merupakan salah satu desa dari 10 (sepuluh) desa di Kecamatan Paseh, Kabupaten Sumedang,
                yang berbatasan langsung dengan Kecamatan Situraja. Dulunya Kecamatan Paseh merupakan bagian atau
                kewedanaan Conggeang.
              </p>

              <div className="mt-8 space-y-0 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                    className={`flex gap-6 py-6 ${
                      i !== TIMELINE.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <span className="shrink-0 text-2xl font-bold text-emerald-400">{item.year}</span>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-8 text-slate-300 leading-8 text-justify">
                Menurut sesepuh desa dan tokoh masyarakat, sejak berdiri sampai sekarang Desa Cijambe telah dipimpin oleh
                Kuwu atau Kepala Desa.
              </p>
            </motion.article>

            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
              className="space-y-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-8"
            >
              <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-400">
                  <BookOpen className="h-4 w-4" /> Catatan
                </p>
                <p className="text-sm leading-7 text-slate-300">
                  Sumber cerita berasal dari warisan lisan masyarakat Cijambe. Halaman ini menyajikan ringkasan legenda dan
                  sejarah desa yang menjadi identitas komunitas lokal.
                </p>
              </div>
              <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-emerald-400">
                  <Users2 className="h-4 w-4" /> Fakta Singkat
                </p>
                <ul className="divide-y divide-white/10">
                  {FAKTA.map(([label, val]) => (
                    <li key={label} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-right font-medium text-white">{val}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-xs font-medium text-emerald-300">
                <CalendarClock className="h-3.5 w-3.5" /> Diperbarui berkala oleh Pemerintah Desa
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}