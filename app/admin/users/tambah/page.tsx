"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showError, showSuccess } from "@/lib/admin/swal";
import { ArrowLeft, AlertCircle, Eye, EyeOff, Loader2, Save, X } from "lucide-react";

export default function TambahAdminPage() {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.target);
    form.set("role_id", "1");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gagal menyimpan (${res.status}): ${text}`);
      }
      await showSuccess("Admin berhasil dibuat.");
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan admin.";
      setError(message);
      await showError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 placeholder:text-slate-400";

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/admin/users"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar admin
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Tambah Admin</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Isi data admin baru dan simpan untuk membuat akses masuk.</p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-4xl">
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

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Nama <span className="text-red-500">*</span></label>
                <input name="name" type="text" required placeholder="Nama lengkap" className={inputClass} />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Username <span className="text-red-500">*</span></label>
                <input name="username" type="text" required placeholder="username" className={inputClass} />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" placeholder="email@domain.com" className={inputClass} />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Telepon</label>
                <input name="phone" type="text" placeholder="+62..." className={inputClass} />
              </div>

              <div className="relative">
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Status Aktif</label>
                <select name="isActive" defaultValue="true" className={inputClass}>
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
