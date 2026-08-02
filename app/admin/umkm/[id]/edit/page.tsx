"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { showError, showSuccess } from "@/lib/admin/swal";
import { Loader2, AlertCircle, ArrowLeft, FileText, ChevronDown, Save } from "lucide-react";

export default function EditUmkmPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, any>>({
    name: "",
    owner: "",
    category: "",
    address: "",
    description: "",
    whatsapp: "",
    googleMapsUrl: "",
    status: "published",
    photo_url: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [fileError, setFileError] = useState("");
  const config = adminResourceConfigs.umkm;

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

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/cms-login");
      return;
    }

    if (session.status === "authenticated" && session.data?.user) {
      const role = (session.data.user as any).role;
      if (role !== 1 && role !== "1") {
        router.push("/");
      }
    }
  }, [session, router]);

  useEffect(() => {
    if (!id) return;

    const fetchUmkm = async () => {
      try {
        const res = await fetch(`/api/umkm/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Data UMKM tidak ditemukan");
        const data = await res.json();
        setValues({
          name: data.name ?? "",
          owner: data.owner ?? "",
          category: data.category ?? "",
          address: data.address ?? "",
          description: data.description ?? "",
          whatsapp: data.whatsapp ?? "",
          googleMapsUrl: data.google_maps_url ?? "",
          status: data.status ?? "published",
          photo_url: data.photo_url ?? "",
        });
        setPhotoPreview(data.photo_url ?? "");
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data UMKM. Pastikan item tersedia.");
      } finally {
        setLoading(false);
      }
    };

    fetchUmkm();
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    setFileError("");

    if (!file) {
      return;
    }

    // Validate file type with flexible checking
    if (!isValidImageFile(file)) {
      setFileError("Format file harus JPG, JPEG, PNG, atau WEBP.");
      event.currentTarget.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      event.currentTarget.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      event.currentTarget.value = "";
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError("");

    if (fileError) {
      setError(fileError);
      setSubmitting(false);
      return;
    }

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/umkm/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Gagal memperbarui UMKM (${res.status}): ${body}`);
      }

      await showSuccess("Perubahan UMKM berhasil disimpan.");
      router.push("/admin/umkm");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan UMKM.";
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
            href="/admin/umkm"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Edit {config.singular}</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Perbarui data usaha lalu simpan perubahan.</p>
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
                <p className="text-sm font-semibold text-slate-800">Detail UMKM</p>
                <p className="text-xs text-slate-500">Ubah kolom yang diperlukan, lalu simpan perubahannya.</p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
              {config.fields.map((field) => {
                const value = values[field.name] ?? "";
                const isWide = field.type === "textarea" || field.type === "file";

                if (field.type === "file") {
                  return (
                    <div key={field.name} className={isWide ? "sm:col-span-2" : ""}>
                      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        {field.label}
                      </label>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex-1">
                          <input
                            type="file"
                            name={field.name}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                            <p className="mt-2 text-xs text-slate-500">Unggah gambar baru untuk mengganti foto saat ini. Format: JPG, JPEG, PNG, WEBP | Maksimal 1 MB</p>
                          )}
                        </div>
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Pratinjau Foto UMKM"
                            className="h-24 w-24 rounded-2xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                            Tidak ada foto
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

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
                        type={field.type === "number" ? "number" : field.type}
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
                disabled={submitting || !!fileError}
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
