"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Mail, MessageSquare, Phone } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Sejarah Desa", href: "/profil-desa" },
  { label: "Infografis", href: "/infografis" },
  { label: "Penghargaan", href: "/penghargaan" },
  { label: "Berita", href: "/berita" },
  { label: "UMKM", href: "/umkm" },
];

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!name.trim() || !message.trim()) {
      setErrorMessage("Nama dan komentar wajib diisi.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData?.error || "Gagal mengirim komentar");
      }

      setStatusMessage("Komentar berhasil dikirim. Terima kasih untuk partisipasinya.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Gagal mengirim komentar");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="bg-emerald-600 px-6 py-16 text-slate-100 sm:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Kontak</p>
          <p className="text-white text-2xl font-semibold">DESA CIJAMBE</p>
          <p className="text-slate-100">Desa Cijambe, Kecamatan Paseh, Kabupaten Sumedang, Jawa Barat</p>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/6285168102868"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:border-white hover:bg-white/15"
            >
              <span className="sr-only">WhatsApp</span>
              <MessageSquare className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/desacijambe.official?igsh=aW1pN2gwdDlqMnlo"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:border-white hover:bg-white/15"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="tel:+6285168102868"
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:border-white hover:bg-white/15"
            >
              <span className="sr-only">Telepon</span>
              <Phone className="h-5 w-5" />
            </a>
            <a
              href="mailto:desacijambe45381@gmail.com"
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:border-white hover:bg-white/15"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Quick Links</p>
          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-slate-100 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Jam Pelayanan</p>
          <p className="text-slate-100">Senin - Kamis</p>
          <p className="text-slate-100">08.00 - 16.00 WIB</p>
          <p className="text-sm text-slate-200">© 2026 Desa Cijambe. All rights reserved.</p>
        </div>
      </div>

      <div id="comments" className="mx-auto mt-12 max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl sm:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Komentar dari Warga</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Berikan masukan atau salam untuk Desa Cijambe</h2>
          <p className="mt-3 max-w-xl text-sm text-emerald-100/90">
            Berbagi pesan, saran, atau apresiasi Anda langsung kepada desa. Komentar Anda akan disimpan untuk ditinjau oleh admin.
          </p>

          <div className="mt-6 space-y-4">
            {statusMessage && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{statusMessage}</div>}
            {errorMessage && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-100">
                  <span className="mb-2 block text-slate-200">Nama</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm text-slate-100">
                  <span className="mb-2 block text-slate-200">Email (opsional)</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email untuk kontak"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
              <label className="block text-sm text-slate-100">
                <span className="mb-2 block text-slate-200">Komentar</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis komentar Anda..."
                  rows={5}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
