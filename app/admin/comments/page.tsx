"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { Pagination } from "@/components/ui/pagination";

export default function AdminCommentsPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredComments = useMemo(() => {
    if (!query.trim()) return comments;
    const q = query.trim().toLowerCase();
    return comments.filter((item) =>
      ["name", "email", "message"].some((key) =>
        String(item[key] ?? "").toLowerCase().includes(q)
      )
    );
  }, [comments, query]);

  const pageCount = Math.max(1, Math.ceil(filteredComments.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const pagedComments = filteredComments.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

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
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?limit=50`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat komentar");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchComments();
  }, [session]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus komentar ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        setComments((current) => current.filter((comment) => comment.id !== id));
        await showSuccess("Komentar berhasil dihapus.");
      } else {
        const message = "Gagal menghapus komentar";
        setError(message);
        await showError(message);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menghapus komentar";
      setError(message);
      await showError(message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-700" />
          <p className="text-sm font-medium tracking-wide text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-16 text-white sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Kelola {adminResourceConfigs.comments.title}</h1>
              <p className="mt-2 text-sm text-emerald-100">{comments.length} komentar terbaru</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700">!</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Komentar Warga</h2>
                <p className="mt-1 text-sm text-slate-500">Lihat dan hapus komentar yang masuk dari halaman publik.</p>
              </div>
              <div className="relative w-full max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari komentar..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {filteredComments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                Tidak ada komentar yang sesuai.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                          <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                          <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Komentar</th>
                          <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
                          <th className="whitespace-nowrap px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedComments.map((comment) => (
                          <tr key={comment.id} className="transition hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-700">{comment.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{comment.email || "-"}</td>
                            <td className="px-6 py-4 max-w-xl truncate text-sm text-slate-700">{comment.message}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {comment.created_at ? new Date(comment.created_at).toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDelete(comment.id)}
                                disabled={deletingId === comment.id}
                                className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === comment.id ? "Menghapus…" : "Hapus"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
