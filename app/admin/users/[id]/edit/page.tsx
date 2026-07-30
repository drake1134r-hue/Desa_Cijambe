"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showError, showSuccess } from "@/lib/admin/swal";
import { ArrowLeft, AlertCircle, Eye, EyeOff, Loader2, Save, X } from "lucide-react";

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    isActive: "true",
  });

  const id = Number(params?.id);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/cms-login");
      return;
    }
    if (!id) {
      setError("ID admin tidak valid");
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await fetch(`/api/users/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch admin: ${res.status}`);
        const data = await res.json();
        setFormValues({
          name: data.name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          isActive: data.is_active ? "true" : "false",
        });
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data admin");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [status, router, id]);

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.target);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gagal menyimpan (${res.status}): ${text}`);
      }
      await showSuccess("Data admin berhasil diperbarui.");
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan admin.";
      setError(message);
      await showError(message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 placeholder:text-slate-400";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-700" />
          <p className="text-sm font-medium tracking-wide text-slate-500">Memuat data admin…</p>
        </div>
      </div>
    );
  }

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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Edit Admin</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Perbarui informasi admin dan simpan perubahan.</p>
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
                <input
                  name="name"
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nama lengkap"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Username <span className="text-red-500">*</span></label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formValues.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="username"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@domain.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Telepon</label>
                <input
                  name="phone"
                  type="text"
                  value={formValues.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+62..."
                  className={inputClass}
                />
              </div>
              <div className="relative sm:col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Password (kosongkan untuk tidak mengubah)</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Kosongkan jika tidak ingin ubah"
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
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">Status Aktif</label>
                <select
                  name="isActive"
                  value={formValues.isActive}
                  onChange={(e) => handleChange("isActive", e.target.value)}
                  className={inputClass}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
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
