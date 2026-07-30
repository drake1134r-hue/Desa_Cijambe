"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";
import Image from "next/image";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, AlertCircle, Plus, Pencil, Trash2, Send, Newspaper, ImageIcon } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  status: string;
  published_at: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export default function AdminBeritaPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const pageCount = Math.max(1, Math.ceil(newsList.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const pagedNews = newsList.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

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
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/berita", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        const data = await response.json();
        setNewsList(data);
      } catch (err) {
        setError("Gagal memuat berita");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchNews();
    }
  }, [session]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus berita ini?");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/berita/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (response.ok) {
        setNewsList(newsList.filter((item) => item.id !== id));
        await showSuccess("Berita berhasil dihapus.");
      } else {
        const text = await response.text().catch(() => "");
        let message = "Gagal menghapus berita";
        try {
          const errorData = text ? JSON.parse(text) : null;
          message = errorData?.error || errorData?.message || message;
        } catch (error) {
          if (text) message = text;
        }
        setError(message);
        await showError(message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus berita";
      setError(message);
      console.error(err);
      await showError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id: number) => {
    setPublishingId(id);
    try {
      const response = await fetch(`/api/berita/${id}`, {
        method: "PUT",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });

      if (response.ok) {
        setNewsList(
          newsList.map((item) =>
            item.id === id
              ? { ...item, status: "published", published_at: new Date().toISOString() }
              : item
          )
        );
      } else {
        setError("Gagal mempublikasikan berita");
      }
    } catch (err) {
      setError("Gagal mempublikasikan berita");
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
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
                Kelola Berita
              </h1>
              <p className="mt-2 text-sm text-emerald-100">
                {newsList.length} berita tersimpan
              </p>
            </div>
            <Link
              href="/admin/berita/tambah"
              className="inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Tambah Berita
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {newsList.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Newspaper className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="font-medium text-slate-700">Belum ada berita</p>
              <p className="mt-1 text-sm text-slate-500">Mulai dengan menambahkan berita pertama Anda.</p>
              <Link
                href="/admin/berita/tambah"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Buat Berita Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Berita
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Tanggal Publish
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedNews.map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              {item.cover_image_url ? (
                                <Image
                                  src={item.cover_image_url}
                                  alt={item.title}
                                  width={80}
                                  height={56}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === "published"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              href={`/admin/berita/${item.id}/edit`}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            {item.status !== "published" && (
                              <button
                                onClick={() => handlePublish(item.id)}
                                disabled={publishingId === item.id}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {publishingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Publish
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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
              <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}