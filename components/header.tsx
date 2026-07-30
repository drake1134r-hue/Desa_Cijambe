"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Grid, FileText, ShoppingBag, Trophy } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/cms-login" || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] bg-emerald-600/40 backdrop-blur-sm shadow-xl shadow-emerald-950/20 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-emerald-950/10">
            <Image src="/images/lambang.png" alt="Lambang Desa" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Desa Cijambe</p>
            <p className="text-xs text-emerald-100/80">Kab. Sumedang</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
          <Link href="/" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link href="/profil-desa" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <Grid className="h-4 w-4" /> Sejarah Desa
          </Link>
          <Link href="/infografis" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <FileText className="h-4 w-4" /> Infografis
          </Link>
          <Link href="/penghargaan" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Penghargaan
          </Link>
          <Link href="/berita" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <FileText className="h-4 w-4" /> Berita
          </Link>
          <Link href="/umkm" className="transition hover:text-emerald-300 inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> UMKM
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/8 p-2 text-white hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

        {/* Mobile menu panel */}
      <div
        aria-hidden={!open}
        className={`md:hidden fixed inset-x-4 top-20 z-[9998] transform rounded-2xl bg-emerald-700/95 p-4 backdrop-blur-sm transition-all duration-300 ${
          open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        }`}
      >
        <ul className="flex flex-col gap-3">
          <li>
            <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <Home className="h-4 w-4 text-emerald-300" /> Beranda
            </Link>
          </li>
          <li>
            <Link href="/profil-desa" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <Grid className="h-4 w-4 text-emerald-300" /> Sejarah Desa
            </Link>
          </li>
          <li>
            <Link href="/infografis" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <FileText className="h-4 w-4 text-emerald-300" /> Infografis
            </Link>
          </li>
          <li>
            <Link href="/penghargaan" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <Trophy className="h-4 w-4 text-emerald-300" /> Penghargaan
            </Link>
          </li>
          <li>
            <Link href="/berita" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <FileText className="h-4 w-4 text-emerald-300" /> Berita
            </Link>
          </li>
          <li>
            <Link href="/umkm" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600/20">
              <ShoppingBag className="h-4 w-4 text-emerald-300" /> UMKM
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
