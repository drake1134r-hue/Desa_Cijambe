import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard Admin</p>
              <h1 className="mt-2 text-4xl font-semibold">Selamat datang di panel admin desa</h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Kembali ke Beranda
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-600">Berita</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-600">Permintaan Layanan</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-600">Keluhan</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
