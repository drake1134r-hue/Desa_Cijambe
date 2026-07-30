"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  status: string;
  author_id: number;
  published_at: string | null;
  created_at: string;
  cover_image_url: string | null;
  is_featured: boolean;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch articles with role guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/cms-login");
      return;
    }

    if (!session?.user) return;

    const role = (session.user as any).role;
    if (role !== 1 && role !== "1") {
      router.push("/");
      return;
    }

    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/berita", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch articles");

        let data = await response.json();
        
        // Filter out deleted articles
        data = data.filter((article: NewsArticle) => article.status !== "deleted");
        
        setArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat berita");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [session, status, router]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus berita ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/berita/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
          const text = await response.text().catch(() => "");
          let message = "Gagal menghapus berita";
          try {
            const errorData = text ? JSON.parse(text) : null;
            message = errorData?.error || errorData?.message || message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
      }

      const removedArticle = await response.json().catch(() => null);
      setArticles((current) => current.filter((article) => article.id !== id));
      showSuccess("Berita berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus berita");
    }
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Kelola Berita</h1>
            <Link
              href="/admin/berita/tambah"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Tambah Berita
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 sm:p-6 grid gap-4 sm:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="Cari judul berita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="published">Dipublikasikan</option>
                <option value="archived">Diarsipkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {articles.length === 0
                  ? "Belum ada berita"
                  : "Tidak ada berita yang sesuai dengan filter"}
              </p>
              {articles.length === 0 && (
                <Link
                  href="/admin/berita/tambah"
                  className="inline-block text-blue-600 hover:text-blue-800"
                >
                  Buat berita pertama Anda
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dipublikasikan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(article.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            article.status === "published"
                              ? "bg-green-100 text-green-800"
                              : article.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {article.status === "published"
                            ? "Dipublikasikan"
                            : article.status === "draft"
                            ? "Draft"
                            : "Diarsipkan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/berita/${article.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                        {article.status === "published" && (
                          <Link
                            href={`/berita/${article.slug}`}
                            className="text-green-600 hover:text-green-800 text-xs"
                            target="_blank"
                          >
                            Lihat
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
