"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Tag, Store } from "lucide-react";

export type UmkmItem = {
  id: number;
  name: string;
  category: string;
  location: string;
  phone: string;
  image: string;
};

export const UMKM_SAMPLE: UmkmItem[] = [
  {
    id: 1,
    name: "Warung Makan Sari",
    category: "Kuliner",
    location: "Dusun Tengah",
    phone: "+62 812 1111 2222",
    image: "/images/umkm1.jpg",
  },
  {
    id: 2,
    name: "Kerajinan Anyam",
    category: "Kerajinan",
    location: "Dusun Barat",
    phone: "+62 812 3333 4444",
    image: "/images/umkm2.jpg",
  },
  {
    id: 3,
    name: "Toko Pertanian",
    category: "Perdagangan",
    location: "Pasar Desa",
    phone: "+62 812 5555 6666",
    image: "/images/umkm3.jpg",
  },
];

export default function UmkmList({ items = UMKM_SAMPLE }: { items?: UmkmItem[] }) {
  return (
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
            <span className="h-px w-8 bg-emerald-400" /> Direktori UMKM <span className="h-px w-8 bg-emerald-400" />
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Usaha Mikro, Kecil & Menengah Desa Cijambe
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Temukan pelaku UMKM lokal yang mendukung ekonomi desa dengan produk dan layanan khas Cijambe.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u, index) => (
            <motion.article
              key={u.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <Image
                  src={u.image}
                  alt={u.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                  <Tag className="h-3.5 w-3.5" /> {u.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-slate-950">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Store className="h-4 w-4" />
                  </span>
                  <h3 className="text-lg font-semibold">{u.name}</h3>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {u.location}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" /> {u.phone}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Link
                    href={`/umkm/${u.id}`}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Lihat
                  </Link>
                  <Link
                    href={`https://wa.me/${u.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    Hubungi
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/umkm"
            className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500"
          >
            Selengkapnya
          </Link>
        </div>
      </div>
    </section>
  );
}
