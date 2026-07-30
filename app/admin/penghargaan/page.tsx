"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import { Pagination } from "@/components/ui/pagination";

export default function AdminPenghargaanPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const pagedItems = items.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

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
        const res = await fetch(adminResourceConfigs.penghargaan.apiPath, {
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
      const res = await fetch(`${adminResourceConfigs.penghargaan.apiPath}/${id}`, {
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

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-16 text-white sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-emerald-200">
                Admin Panel
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Kelola {adminResourceConfigs.penghargaan.title}
              </h1>
              <p className="mt-2 text-sm text-emerald-100">
                {items.length} data tersimpan
              </p>
            </div>
            <Link
              href="/admin/penghargaan/tambah"
              className="inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Tambah
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-emerald-600">
                  <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM10 6a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 0110 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-medium text-slate-700">Belum ada data</p>
              <p className="mt-1 text-sm text-slate-500">Mulai dengan menambahkan data pertama Anda.</p>
              <Link
                href="/admin/penghargaan/tambah"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Buat Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        {adminResourceConfigs.penghargaan.listFields.map((f) => (
                          <th
                            key={f.key}
                            className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {f.label}
                          </th>
                        ))}
                        <th className="whitespace-nowrap px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedItems.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-50">
                        {adminResourceConfigs.penghargaan.listFields.map((f) => (
                          <td key={f.key} className="px-6 py-4 text-sm text-slate-700">
                            {String(item[f.key] ?? "-")}
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              href={`/admin/penghargaan/${item.id}/edit`}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === item.id ? (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                </svg>
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
              <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}