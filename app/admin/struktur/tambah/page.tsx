"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { showError, showSuccess } from "@/lib/admin/swal";
import { ArrowLeft, AlertCircle, Loader2, ImagePlus, X, Save } from "lucide-react";

export default function TambahStrukturPage() {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const config = adminResourceConfigs.struktur;

  const handleFileChange = (fieldName: string, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [fieldName]: url }));
  };

  const clearFile = (fieldName: string) => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${fieldName}"]`);
    if (input) input.value = "";
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.target);

    try {
      const res = await fetch(config.apiPath, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gagal menyimpan (${res.status}): ${text}`);
      }
      await showSuccess("Data berhasil disimpan.");
      router.push("/admin/struktur");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan data";
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/admin/struktur"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tambah {config.title}
          </h1>
          <p className="mt-2 text-sm text-emerald-100/80">
            Lengkapi formulir di bawah untuk menambahkan data baru.
          </p>
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

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            encType="multipart/form-data"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {config.fields.map((field) => {
                const isWide = field.type === "textarea" || field.type === "file";
                return (
                  <div key={field.name} className={isWide ? "sm:col-span-2" : ""}>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        defaultValue=""
                        required={field.required}
                        className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
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
                    ) : field.type === "file" ? (
                      <div className="mt-1.5">
                        {previews[field.name] ? (
                          <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300">
                            <img
                              src={previews[field.name]}
                              alt="Pratinjau"
                              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <div className="min-w-0 flex-1 text-xs text-slate-500 group-hover:text-slate-700">
                              <p className="font-semibold text-slate-800">Pratinjau gambar baru</p>
                              <p>Klik area ini untuk mengganti file atau klik Hapus untuk membuang pilihan.</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                clearFile(field.name);
                              }}
                              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50"
                            >
                              Hapus
                            </button>
                            <input
                              type="file"
                              name={field.name}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(field.name, e.target.files)}
                            />
                          </label>
                        ) : (
                          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
                            <ImagePlus className="h-5 w-5 text-slate-400" />
                            <span>
                              <span className="font-semibold text-emerald-600">Pilih file</span> atau seret ke sini
                            </span>
                            <input
                              type="file"
                              name={field.name}
                              accept="image/*"
                              required={field.required}
                              className="hidden"
                              onChange={(e) => handleFileChange(field.name, e.target.files)}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
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