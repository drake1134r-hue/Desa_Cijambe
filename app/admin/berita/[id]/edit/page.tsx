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
  const [fileError, setFileError] = useState("");

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const isValidImageFile = (file: File): boolean => {
    // Check if file has size
    if (file.size === 0) {
      return false;
    }

    // Check MIME type first (most reliable)
    if (file.type && file.type.startsWith("image/")) {
      return true;
    }

    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
    return allowedExts.some((ext) => fileName.endsWith(ext));
  };

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
    setFileError("");

    if (!file) {
      setFormData((prev) => ({ ...prev, coverImageFile: null }));
      return;
    }

    // Validate file type with flexible checking
    if (!isValidImageFile(file)) {
      setFileError("Format file harus JPG, JPEG, PNG, atau WEBP.");
      e.target.value = "";
      setFormData((prev) => ({ ...prev, coverImageFile: null }));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      e.target.value = "";
      setFormData((prev) => ({ ...prev, coverImageFile: null }));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      e.target.value = "";
      setFormData((prev) => ({ ...prev, coverImageFile: null }));
      return;
    }

    setFormData((prev) => ({ ...prev, coverImageFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (fileError) {
      setError(fileError);
      setSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("summary", formData.summary);
      payload.append("content", formData.content);
      payload.append("status", formData.status);
      // category is not editable in this form (kept unchanged)
      if (formData.coverImageFile) {
        payload.append("coverImageUrl", formData.coverImageFile);
      } else if (formData.coverImageUrl) {
        payload.append("coverImageUrl", formData.coverImageUrl);
      }

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
    <main className="min-h-screen bg-slate-50 pt-20">
      <section className="bg-emerald-600 px-6 py-16 text-white sm:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
          <h1 className="mt-4 text-4xl font-semibold">Edit Berita</h1>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-6 rounded-[2rem] border border-red-200 bg-red-50 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-[2rem] border border-green-200 bg-green-50 p-4 text-green-700">
                <p>{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-950">
                Judul
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan judul berita"
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <label htmlFor="summary" className="block text-sm font-semibold text-slate-950">
                Ringkasan
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan ringkasan berita"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-semibold text-slate-950">
                Konten
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={10}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan konten berita (HTML diizinkan)"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-slate-950">Gambar Sampul (upload)</label>
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {fileError && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-3">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-red-700">{fileError}</p>
                </div>
              )}
              {!fileError && (
                <p className="mt-2 text-xs text-slate-500">Format: JPG, JPEG, PNG, WEBP | Maksimal 1 MB</p>
              )}
            </div>

            {/* Category removed from edit form */}

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-slate-950">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Dipublikasikan</option>
                <option value="archived">Diarsipkan</option>
              </select>
            </div>

            {/* extra admin fields removed to match add form */}

            <div className="flex gap-4 justify-end pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !!fileError}
                className="flex-1 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
