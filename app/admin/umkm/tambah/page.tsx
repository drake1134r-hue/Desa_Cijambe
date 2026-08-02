"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { adminResourceConfigs } from "@/lib/admin/resources";
import { showError, showSuccess } from "@/lib/admin/swal";

export default function TambahUmkmPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const config = adminResourceConfigs.umkm;

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const isValidImageFile = (file: File): boolean => {
    // Check MIME type first
    if (ALLOWED_TYPES.includes(file.type)) {
      return true;
    }

    // Extended MIME type variations
    const extendedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/x-jpeg",
      "image/x-jpg",
      "image/png",
      "image/x-png",
      "image/webp",
      "image/x-webp",
    ];

    if (extendedTypes.includes(file.type)) {
      return true;
    }

    // Fallback: check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop() || "";
    return ALLOWED_EXTENSIONS.includes(fileExtension);
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFileError("");

    try {
      const form = new FormData(e.currentTarget);
      const photoFile = form.get("photo") as File | null;

      // Validate file if provided
      if (photoFile && photoFile.size > 0) {
        if (!ALLOWED_TYPES.includes(photoFile.type)) {
          setFileError("Format file harus JPG, JPEG, PNG, atau WEBP.");
          setLoading(false);
          return;
        }
        if (photoFile.size > MAX_FILE_SIZE) {
          setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(config.apiPath, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Gagal menyimpan UMKM (${res.status}): ${body}`);
      }

      await showSuccess("Data UMKM berhasil disimpan.");
      router.push("/admin/umkm");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan data UMKM.";
      setError(message);
      await showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file || file.size === 0) {
      return;
    }

    // Validate file type with flexible checking
    if (!isValidImageFile(file)) {
      setFileError("Format file harus JPG, JPEG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi 1 MB. Silakan pilih file yang lebih kecil.");
      e.target.value = "";
      return;
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 placeholder:text-slate-400";

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
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
            href="/admin/umkm"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100 transition-colors hover:text-white"
          >
            ← Kembali ke daftar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Admin Panel</p>
          <h1 className="mt-4 text-4xl font-semibold">Tambah {config.title}</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Lengkapi formulir berikut untuk menambahkan usaha baru.</p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" encType="multipart/form-data">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

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
                      <div>
                        <input
                          type="file"
                          name={field.name}
                          accept="image/*"
                          required={field.required}
                          onChange={handleFileChange}
                          className={`${inputClass} cursor-pointer border-dashed bg-slate-50`}
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
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : field.type}
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !!fileError}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan UMKM"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
