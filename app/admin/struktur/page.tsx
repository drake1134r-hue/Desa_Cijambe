"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { Pagination } from "@/components/ui/pagination";
import { Network, Plus, Pencil, Trash2, AlertCircle, Loader2, Search, Users } from "lucide-react";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, photoUrl }: { name?: string; photoUrl?: string | null }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-xs font-semibold text-emerald-700">
      {photoUrl ? (
        <Image src={photoUrl} alt={name ?? "Foto"} fill sizes="40px" className="object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export default function AdminStrukturPage() {
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
        const res = await fetch(adminResourceConfigs.struktur.apiPath, {
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
      const res = await fetch(`${adminResourceConfigs.struktur.apiPath}/${id}`, {
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
    const q = query.trim().toLowerCase();
    return items.filter((item) =>
      adminResourceConfigs.struktur.listFields.some((f) => String(item[f.key] ?? "").toLowerCase().includes(q))
    );
  }, [items, query]);

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

  if (status === "loading" || loading) {
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
      <section className="relative overflow-hidden bg-emerald-600 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              <Network className="h-4 w-4" />
              Admin Panel
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Kelola {adminResourceConfigs.struktur.title}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-emerald-100/80">
              <Users className="h-3.5 w-3.5" />
              {items.length} item terdaftar
            </p>
          </div>
          <Link
            href="/admin/struktur/tambah"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Link>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Network className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="mt-4 font-medium text-slate-700">Belum ada data</p>
              <p className="mt-1 text-sm text-slate-400">Struktur organisasi yang kamu buat akan muncul di sini.</p>
              <Link
                href="/admin/struktur/tambah"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Buat Pertama
              </Link>
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama atau jabatan..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-medium text-slate-500">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="grid gap-3 md:hidden">
                    {pagedItems.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <Avatar name={item.name ?? item.title} photoUrl={item.photo_url} />
                          <div className="min-w-0 flex-1">
                            {adminResourceConfigs.struktur.listFields.map((f) => (
                              <p key={f.key} className="truncate text-sm text-slate-700">
                                <span className="text-slate-400">{f.label}: </span>
                                {String(item[f.key] ?? "-")}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                          <Link
                            href={`/admin/struktur/${item.id}/edit`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <th className="w-14 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              No.
                            </th>
                            <th className="w-14 px-2 py-4"></th>
                            {adminResourceConfigs.struktur.listFields.map((f) => (
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
                          {pagedItems.map((item, index) => (
                            <tr key={item.id} className="transition-colors hover:bg-emerald-50/40">
                              <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                              <td className="px-2 py-4">
                                <Avatar name={item.name ?? item.title} photoUrl={item.photo_url} />
                              </td>
                              {adminResourceConfigs.struktur.listFields.map((f) => (
                                <td key={f.key} className="px-6 py-4 text-sm text-slate-700">
                                  {String(item[f.key] ?? "-")}
                                </td>
                              ))}
                              <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                  <Link
                                    href={`/admin/struktur/${item.id}/edit`}
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
              <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}