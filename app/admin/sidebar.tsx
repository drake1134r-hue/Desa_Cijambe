"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Logout",
      text: "Apakah Anda yakin ingin keluar dari admin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Tidak",
      reverseButtons: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#475569",
      customClass: {
        popup: "admin-swal-popup",
        title: "admin-swal-title",
        content: "admin-swal-content",
        confirmButton: "admin-swal-confirm",
        cancelButton: "admin-swal-cancel",
      },
    });

    if (result.isConfirmed) {
      await signOut({ callbackUrl: "/cms-login" });
    }
  }

  return (
    <>
      <aside className={`admin-sidebar ${open ? "open" : ""}`} role="dialog" aria-modal={open ? "true" : "false"} aria-label="Menu admin">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <img src="/images/lambang.png" alt="Desa Cijambe" />
            <div>
              <strong>CMS Desa Cijambe</strong>
              <span>Admin Panel</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Tutup menu sidebar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="admin-nav">
          <Link href="/admin/dashboard" onClick={onClose}>Dashboard</Link>
          <Link href="/admin/users" onClick={onClose}>Manajemen Admin</Link>
          <Link href="/admin/struktur" onClick={onClose}>Struktur Organisasi</Link>
          <Link href="/admin/homepage" onClick={onClose}>Konten Beranda</Link>
          <Link href="/admin/umkm" onClick={onClose}>UMKM</Link>
          <Link href="/admin/berita" onClick={onClose}>Berita</Link>
          <Link href="/admin/infografis" onClick={onClose}>Infografis</Link>
          <Link href="/admin/penghargaan" onClick={onClose}>Penghargaan</Link>
          <Link href="/admin/comments" onClick={onClose}>Komentar Warga</Link>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${open ? "visible" : ""}`}
        onClick={onClose}
      />
    </>
  );
}
