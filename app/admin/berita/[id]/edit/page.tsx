"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showError, showSuccess } from "@/lib/admin/swal";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  author_id: number;
  category_id: number | null;
  is_featured: boolean;
  published_at: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const id = params.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    coverImageFile: null as File | null,
    status: "draft",
    // fields aligned with add form
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/berita/${id}`);
        if (!response.ok) throw new Error("Failed to fetch article");

        const data = await response.json();
        setArticle(data);
        setFormData({
          title: data.title,
          summary: data.summary,
          content: data.content,
          coverImageUrl: data.cover_image_url || "",
          coverImageFile: null,
          status: data.status,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat artikel"
        );
      } finally {
        setLoading(false);
      }
    };

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

    if (id) {
      fetchArticle();
    }
  }, [id, session]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, coverImageFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("summary", formData.summary);
      payload.append("content", formData.content);
      payload.append("status", formData.status);
      // category is not editable in this form (kept unchanged)
      if (formData.coverImageFile) payload.append("coverImageUrl", formData.coverImageFile);
      else payload.append("coverImageUrl", formData.coverImageUrl || "");

      const response = await fetch(`/api/berita/${id}`, {
        method: "PUT",
        body: payload,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memperbarui artikel");
      }

      setSuccessMessage("Artikel berhasil diperbarui!");
      await showSuccess("Artikel berhasil diperbarui!");
      router.push("/admin/berita");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      await showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Artikel tidak ditemukan
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Edit Berita
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan judul berita"
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Ringkasan
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan ringkasan berita"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Konten
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Masukkan konten berita (HTML diizinkan)"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-2">Gambar Sampul (upload)</label>
              {formData.coverImageUrl && !formData.coverImageFile && (
                <div className="mb-2">
                  <img src={formData.coverImageUrl} alt="cover" className="h-40 w-auto rounded-md object-cover" />
                </div>
              )}
              <input
                type="file"
                id="coverImageUrl"
                name="coverImageUrl"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category removed from edit form */}

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Dipublikasikan</option>
                <option value="archived">Diarsipkan</option>
              </select>
            </div>

            {/* extra admin fields removed to match add form */}

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium transition"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
