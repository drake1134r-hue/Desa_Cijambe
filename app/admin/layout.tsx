import "./admin.css";
import AdminShell from "@/app/admin/admin-shell";

export const metadata = {
  title: "Admin CMS Desa Cijambe",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
