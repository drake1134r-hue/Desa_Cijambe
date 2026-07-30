"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownCircle, MapPin } from "lucide-react";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <section
      id="home"
      ref={heroRef}
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
              "AMMAN BERKAT"
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
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
        <motion.div animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDownCircle className="h-12 w-12 text-white/80" />
        </motion.div>
      </div>
    </section>
  );
}
