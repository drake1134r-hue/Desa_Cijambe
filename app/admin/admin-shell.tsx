"use client";

import { useState } from "react";
import AdminSidebar from "@/app/admin/sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-top">
            <div>
              <p className="admin-badge">Area Admin</p>
              <h1>Panel Kontrol</h1>
            </div>
            <button
              type="button"
              className="admin-header-toggle"
              aria-label={isSidebarOpen ? "Tutup menu sidebar" : "Buka menu sidebar"}
              onClick={() => setIsSidebarOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
