"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showError, showSuccess } from "@/lib/admin/swal";

export default function TambahBeritaPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    categoryId: null,
    coverImageFile: null as File | null,
    status: "draft",
  });

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setLoading(true);
    setError("");

    if (!formData.title || !formData.summary || !formData.content) {
      setError("Judul, ringkasan, dan konten harus diisi");
      setLoading(false);
      return;
    }

    if (fileError) {
      setError(fileError);
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("summary", formData.summary);
      payload.append("content", formData.content);
      if (formData.categoryId) payload.append("categoryId", String(formData.categoryId));
      if (formData.coverImageFile) payload.append("coverImageUrl", formData.coverImageFile);
      payload.append("status", formData.status || "draft");

      const response = await fetch("/api/berita", {
        method: "POST",
        body: payload,
        credentials: "include",
      });

      if (response.ok) {
        await showSuccess("Berita berhasil disimpan.");
        router.push("/admin/berita");
      } else {
        setError("Gagal membuat berita");
        await showError("Gagal membuat berita.");
      }
    } catch (err) {
      setError("Gagal membuat berita");
      console.error(err);
      await showError("Gagal membuat berita.");
    } finally {
      setLoading(false);
    }
  };

  // role guard: redirect non-admins to home, unauthenticated to login
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

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <section className="bg-emerald-600 px-6 py-16 text-white sm:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">
            Admin Panel
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Tambah Berita Baru</h1>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
            encType="multipart/form-data"
          >
            {error && (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-950">
                Judul *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Masukkan judul berita"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-950">
                Ringkasan *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Masukkan ringkasan berita (max 500 karakter)"
                maxLength={500}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-950">
                Konten *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Masukkan konten berita lengkap"
                rows={10}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-950">Status</label>
              <select
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

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-950">Gambar Sampul (upload)</label>
              <input
                type="file"
                accept="image/*"
                name="coverImageUrl"
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

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || !!fileError}
                className="flex-1 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Berita"}
              </button>
              <Link
                href="/admin/berita"
                className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
