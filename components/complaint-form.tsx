"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Infrastruktur",
  "Pelayanan",
  "Lingkungan",
  "UMKM",
  "Kesehatan",
];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    category: categories[0],
    location: "",
    report: "",
  });
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="complaint" className="bg-slate-950 px-6 py-20 text-white sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Pengaduan Online</p>
          <h2 className="mt-4 text-4xl font-semibold">Laporkan Masalah Desa Secara Mudah</h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-slate-300">
              Kirim pengaduan Anda secara transparan dan pantau statusnya. Pengaduan akan diteruskan ke tim pemerintahan desa.
            </p>
            <div className="mt-10 grid gap-4">
              <div className="rounded-3xl bg-slate-900/80 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Status Pengaduan</p>
                <p className="mt-3 text-3xl font-semibold">Menunggu</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Layanan</p>
                <p className="mt-3 text-3xl font-semibold">Tracking Online</p>
              </div>
            </div>
          </div>
          <form
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Nama
                  <Input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Nama lengkap"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Nomor HP
                  <Input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="0812xxxxxx"
                    required
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-300">
                Email
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="email@domain.com"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Kategori
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
                  )}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Lokasi
                <Input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="Contoh: RT 01 RW 02"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Isi Laporan
                <textarea
                  value={form.report}
                  onChange={(event) => setForm({ ...form, report: event.target.value })}
                  placeholder="Jelaskan masalah atau keluhan Anda..."
                  className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
              <button type="submit" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}> 
                Kirim Pengaduan
              </button>
              {submitted ? (
                <p className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Terima kasih! Pengaduan Anda telah dikirim. Tim desa akan memprosesnya segera.
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
