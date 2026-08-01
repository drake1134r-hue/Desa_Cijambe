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
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
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
