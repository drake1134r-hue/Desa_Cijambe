"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import { Pagination } from "@/components/ui/pagination";
import { Network, Plus, Pencil, Trash2, AlertCircle, Loader2, Search, Layers, X } from "lucide-react";

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-24 rounded bg-slate-100" />
        </td>
      ))}
      <td className="px-6 py-4">
        <div className="mx-auto h-7 w-24 rounded-full bg-slate-100" />
      </td>
    </tr>
  );
}

export default function AdminHomepagePage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const config = adminResourceConfigs.homepage;

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
        const res = await fetch(config.apiPath, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data. Coba muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchItems();
  }, [session, config.apiPath]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${config.apiPath}/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        setItems(items.filter((it) => it.id !== id));
        await showSuccess("Data berhasil dihapus.");
      } else {
        setError("Gagal menghapus item. Silakan coba lagi.");
        await showError("Gagal menghapus data.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus item. Silakan coba lagi.");
      await showError("Gagal menghapus data.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) =>
      config.listFields.some((f) => String(item[f.key] ?? "").toLowerCase().includes(q))
    );
  }, [items, query, config.listFields]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const pagedItems = filteredItems.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              <Network className="h-4 w-4" />
              Admin Panel
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Kelola {config.title}</h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-50 backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              {loading ? "Memuat..." : `${items.length} item terdaftar`}
            </div>
          </div>
          <Link
            href="/admin/homepage/tambah"
            className="group inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/25 active:translate-y-0"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Tambah
          </Link>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="flex-1">{error}</p>
              <button
                onClick={() => setError("")}
                className="shrink-0 rounded-full p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
                aria-label="Tutup pesan error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!loading && items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Network className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="mt-4 font-medium text-slate-700">Belum ada data</p>
              <p className="mt-1 text-sm text-slate-400">Konten homepage yang kamu buat akan muncul di sini.</p>
              <Link
                href="/admin/homepage/tambah"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Buat Pertama
              </Link>
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-emerald-100">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari data..."
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              {loading ? (
                <>
                  {/* Mobile skeleton */}
                  <div className="grid gap-3 md:hidden">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="space-y-2">
                          <div className="h-3 w-3/4 rounded bg-slate-100" />
                          <div className="h-3 w-1/2 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop skeleton */}
                  <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                    <table className="w-full">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          {config.listFields.map((f) => (
                            <th key={f.key} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              {f.label}
                            </th>
                          ))}
                          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <SkeletonRow columns={config.listFields.length} />
                        <SkeletonRow columns={config.listFields.length} />
                        <SkeletonRow columns={config.listFields.length} />
                      </tbody>
                    </table>
                  </div>
                </>
              ) : filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <Search className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Tidak ada hasil untuk &ldquo;{query}&rdquo;
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Hapus pencarian
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="grid gap-3 md:hidden">
                    {pagedItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="min-w-0 flex-1">
                          {config.listFields.map((f, i) => (
                            <p
                              key={f.key}
                              className={i === 0 ? "truncate text-sm font-semibold text-slate-800" : "mt-1 truncate text-sm text-slate-500"}
                            >
                              {i !== 0 && <span className="text-slate-400">{f.label}: </span>}
                              {String(item[f.key] ?? "-")}
                            </p>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                          <Link
                            href={`/admin/homepage/${item.id}/edit`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-slate-200 bg-slate-50">
                          <tr>
                            {config.listFields.map((f) => (
                              <th key={f.key} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {f.label}
                              </th>
                            ))}
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedItems.map((item) => (
                            <tr key={item.id} className="group transition-colors hover:bg-emerald-50/50">
                              {config.listFields.map((f, i) => (
                                <td
                                  key={f.key}
                                  className={i === 0 ? "px-6 py-4 text-sm font-semibold text-slate-800" : "px-6 py-4 text-sm text-slate-600"}
                                >
                                  {String(item[f.key] ?? "-")}
                                </td>
                              ))}
                              <td className="px-6 py-4">
                                <div className="flex justify-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                                  <Link
                                    href={`/admin/homepage/${item.id}/edit`}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingId === item.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {filteredItems.length > 0 && <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />}
            </>
          )}
        </div>
      </section>
    </main>
  );
}