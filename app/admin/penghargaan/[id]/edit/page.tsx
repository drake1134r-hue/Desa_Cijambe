"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { showError, showSuccess } from "@/lib/admin/swal";
import { Loader2, AlertCircle, ArrowLeft, FileText, ChevronDown, Save } from "lucide-react";

export default function EditPenghargaanPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, any>>({
    title: "",
    year: 0,
    organizer: "",
    description: "",
    order: 0,
    isActive: "true",
  });
  const config = adminResourceConfigs.penghargaan;

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/penghargaan/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Data tidak ditemukan");
        const data = await res.json();
        setValues({
          title: data.title ?? "",
          year: data.year ?? 0,
          organizer: data.organizer ?? "",
          description: data.description ?? "",
          order: data.order ?? 0,
          isActive: data.is_active ? "true" : "false",
        });
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data. Pastikan item tersedia.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/penghargaan/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memperbarui data");
      await showSuccess("Perubahan berhasil disimpan.");
      router.push("/admin/penghargaan");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan.";
      setError(message);
      await showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (session.status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/admin/penghargaan"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Edit {config.singular}</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Perbarui informasi di bawah, lalu simpan perubahan.</p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Terjadi kesalahan</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" encType="multipart/form-data">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Detail Penghargaan</p>
                <p className="text-xs text-slate-500">Ubah kolom yang diperlukan, sisanya boleh dibiarkan</p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
              {config.fields.map((field) => {
                const value = values[field.name] ?? "";
                const isWide = field.type === "textarea";
                return (
                  <div key={field.name} className={isWide ? "sm:col-span-2" : ""}>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : field.type === "select" ? (
                      <div className="relative mt-1.5">
                        <select
                          name={field.name}
                          value={value}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          required={field.required}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="" disabled>
                            {field.placeholder ?? `Pilih ${field.label}`}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        name={field.name}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/40 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
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
