"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { confirmDelete, showError, showSuccess } from "@/lib/admin/swal";

const ITEMS_PER_PAGE = 5;

type AdminUser = {
  id: number;
  name: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data admin");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchUsers();
  }, [session, query]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      [item.name, item.username, item.email, item.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const pagedItems = filteredItems.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("Yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setItems(items.filter((item) => item.id !== id));
      await showSuccess("Admin berhasil dihapus.");
    } catch (err) {
      console.error(err);
      await showError("Gagal menghapus admin.");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-700" />
          <p className="text-sm font-medium tracking-wide text-slate-500">Memuat data…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] pt-20">
      <section className="border-b border-emerald-900/10 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-800 px-6 py-12 text-white sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-300">
                Admin Panel · Data Admin
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Kelola Admin
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100/80">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 font-mono text-xs font-semibold text-white">
                  {items.length}
                </span>
                pengelola terdaftar
              </p>
            </div>
            <Link
              href="/admin/users/tambah"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-amber-400 hover:text-emerald-950"
            >
              <span className="text-lg leading-none transition group-hover:rotate-90">+</span>
              Tambah Admin
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <span className="mt-0.5 text-red-500">⚠</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari admin…"
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            {query && (
              <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
                {filteredItems.length} hasil
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="w-14 px-6 py-4 text-left font-mono text-xs uppercase tracking-wider text-slate-400">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Telepon
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((item, idx) => (
                    <tr key={item.id} className="group border-b border-slate-100 transition last:border-b-0 hover:bg-emerald-50/40">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.email ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.phone ?? "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/users/${item.id}/edit`}
                            className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === item.id ? "Menghapus…" : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Pagination page={currentPageSafe} pageCount={pageCount} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
