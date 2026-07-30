"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

function CmsLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";
  const { status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl,
      });

      console.debug("signIn result:", result);

      if (result?.error) {
        setError("Username atau kata sandi salah.");
        return;
      }

      router.replace(callbackUrl);
    } catch (err) {
      console.error("signIn threw error:", err);
      setError("Terjadi kesalahan saat mencoba masuk.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex bg-emerald-50 font-sans">
      {/* Panel kiri — identitas desa */}
      <section className="relative hidden md:flex md:w-1/2 lg:w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-b from-green-900 via-green-800 to-emerald-700 text-white p-10">
        {/* Motif kontur/terasering sawah sebagai signature element */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M -50 ${120 + i * 110} Q 150 ${60 + i * 110}, 450 ${140 + i * 110}`}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/images/lambang.png"
            alt="Lambang Desa"
            className="h-12 w-12 object-contain drop-shadow"
          />
          <span className="text-sm font-medium tracking-wide text-emerald-100">
            Pemerintah Desa Cijambe
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold leading-tight mb-3">
            Portal Admin
            <br />
            Desa Cijambe
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed max-w-xs">
            Kelola konten desa, layanan warga, dan informasi publik melalui
            satu pintu akses khusus admin.
          </p>
        </div>

        <p className="relative z-10 text-xs text-emerald-200/70">
          &copy; {new Date().getFullYear()} Desa Cijambe. Akses terbatas untuk
          pengelola resmi.
        </p>
      </section>

      {/* Panel kanan — form login */}
      <section className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Brand ringkas untuk mobile (panel kiri disembunyikan) */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img
              src="/images/lambang.png"
              alt="Lambang Desa"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="font-serif text-lg font-bold text-green-900">
                Portal Admin Desa Cijambe
              </p>
            </div>
          </div>

          <div className="hidden md:block mb-8">
            <h2 className="font-serif text-2xl font-bold text-green-900">
              Masuk ke Akun
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Masukkan kredensial admin untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Username
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center rounded px-2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.657 0 3.22.402 4.565 1.11" />
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1.05 12C2.73 7.1 7.11 4 12 4c4.89 0 9.27 3.1 10.95 8-1.68 4.9-6.06 8-10.95 8-4.89 0-9.27-3.1-10.95-8z" />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-green-700 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CmsLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-emerald-50">Memuat...</div>}>
      <CmsLoginContent />
    </Suspense>
  );
}