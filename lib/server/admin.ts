import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

export function isUserAdmin(session: any) {
  const role = session?.user?.role;
  return role === 1 || role === "1";
}

export function ensureAdmin(session: any) {
  if (!session || !isUserAdmin(session)) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
