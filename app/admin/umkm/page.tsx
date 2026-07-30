"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import { Pagination } from "@/components/ui/pagination";

export default function AdminUmkmPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/cms-login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role !== 1 && role !== "1") {
        router.push("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(adminResourceConfigs.umkm.apiPath, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchItems();
  }, [session]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${adminResourceConfigs.umkm.apiPath}/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        setItems(items.filter((it) => it.id !== id));
        await showSuccess("Data berhasil dihapus.");
      } else {
        const message = "Gagal menghapus item";
        setError(message);
        await showError(message);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menghapus item";
      setError(message);
      await showError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      adminResourceConfigs.umkm.listFields.some((f) =>
        String(item[f.key] ?? "").toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const currentItems = filteredItems.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-700" />
          <p className="text-sm font-medium tracking-wide text-slate-500">Memuat data…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] pt-20">
      {/* Header */}
      <section className="border-b border-emerald-900/10 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-800 px-6 py-12 text-white sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-300">
                Admin Panel · Direktori Usaha
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Kelola {adminResourceConfigs.umkm.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100/80">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 font-mono text-xs font-semibold text-white">
                  {items.length}
                </span>
                entri terdaftar
              </p>
            </div>
            <Link
              href="/admin/umkm/tambah"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-amber-400 hover:text-emerald-950"
            >
              <span className="text-lg leading-none transition group-hover:rotate-90">+</span>
              Tambah Usaha
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <span className="mt-0.5 text-red-500">⚠</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white p-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
                🏪
              </div>
              <p className="text-base font-medium text-slate-700">Belum ada usaha yang terdaftar</p>
              <p className="mt-1 text-sm text-slate-400">Mulai dengan menambahkan data usaha pertama.</p>
              <Link
                href="/admin/umkm/tambah"
                className="mt-6 inline-block rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Buat Pertama
              </Link>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari usaha…"
                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                {query && (
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
                    {filteredItems.length} hasil
                  </p>
                )}
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70">
                        <th className="w-14 px-6 py-4 text-left font-mono text-xs uppercase tracking-wider text-slate-400">
                          No
                        </th>
                        {adminResourceConfigs.umkm.listFields.map((f) => (
                          <th
                            key={f.key}
                            className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                          >
                            {f.label}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="group border-b border-slate-100 transition last:border-b-0 hover:bg-emerald-50/40"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          {adminResourceConfigs.umkm.listFields.map((f, fi) => (
                            <td
                              key={f.key}
                              className={`px-6 py-4 text-sm ${
                                fi === 0 ? "font-semibold text-slate-800" : "text-slate-600"
                              }`}
                            >
                              {String(item[f.key] ?? "-")}
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <Link
                                href={`/admin/umkm/${item.id}/edit`}
                                className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === item.id ? "Menghapus…" : "Hapus"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredItems.length === 0 && query && (
                  <div className="p-10 text-center text-sm text-slate-400">
                    Tidak ada usaha yang cocok dengan pencarian "{query}".
                  </div>
                )}
              </div>
              <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}