"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Tag, Store, ArrowLeft } from "lucide-react";

interface UmkmDetail {
  id: number;
  name: string;
  owner?: string;
  category?: string;
  address?: string;
  whatsapp?: string;
  description?: string;
  photo_url?: string;
  google_maps_url?: string;
  status?: string;
}

export default function UmkmDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [item, setItem] = useState<UmkmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/umkm/${id}`, { cache: "no-store" });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "UMKM tidak ditemukan");
        }

        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data UMKM.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-base">Memuat data UMKM...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 px-6">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg shadow-slate-200/40">
          <h1 className="mb-4 text-3xl font-semibold text-slate-900">UMKM tidak ditemukan</h1>
          <p className="mb-6 text-slate-500">{error || "Data UMKM tidak tersedia."}</p>
          <Link
            href="/umkm"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke menu UMKM
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = item.photo_url || "/images/umkm1.jpg";
  const phone = item.whatsapp || "-";
  const location = item.address || "-";
  const googleMapsUrl = item.google_maps_url || "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pt-24">
      <section className="relative overflow-hidden bg-white">
        <div className="relative mx-auto max-w-6xl px-6 py-8 sm:px-12">
          <Link
            href="/umkm"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke menu UMKM
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12 sm:px-12">
        <div className="grid gap-10 xl:grid-cols-[1.25fr_0.85fr]">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <div className="relative h-96 w-full bg-slate-100">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                quality={100}
                unoptimized
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>
            <div className="space-y-6 p-8 sm:p-10 text-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    <Tag className="h-3.5 w-3.5" /> {item.category || "Umum"}
                  </span>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{item.name}</h1>
                  <p className="mt-3 text-sm text-slate-500">Pemilik: {item.owner || "-"}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                  {item.status ? item.status.toUpperCase() : "DRAFT"}
                </span>
              </div>

              <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Lokasi</h2>
                  <p className="text-sm leading-7 text-slate-700 flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 text-emerald-500" /> {location}
                  </p>
                </div>
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Kontak</h2>
                  <p className="text-sm leading-7 text-slate-700 flex items-start gap-2">
                    <Phone className="mt-1 h-4 w-4 text-emerald-500" /> {phone}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Deskripsi UMKM</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{item.description || "Belum ada deskripsi."}</p>
                </div>
                {googleMapsUrl ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Lokasi Google Maps</h2>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm font-semibold text-emerald-700 underline transition hover:text-emerald-900"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ringkasan</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-emerald-500" />
                  <span>Nama UMKM</span>
                </div>
                <p className="text-base font-semibold text-slate-900">{item.name}</p>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-emerald-500" />
                  <span>Kategori</span>
                </div>
                <p className="text-base font-semibold text-slate-900">{item.category || "Umum"}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Aksi</h2>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  Hubungi via WhatsApp
                </a>
                {googleMapsUrl ? (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Lihat di Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
