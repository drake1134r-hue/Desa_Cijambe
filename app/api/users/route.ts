import { findMany, findOne, insertOne } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { parseRequestUrl, parseRequestBody, requireAdmin, jsonResponse, errorResponse } from "@/lib/server/apiHelpers";
import { sanitizeText } from "@/lib/server/validation";
import { hash } from "bcryptjs";

export const GET = async (req: Request) => {
  try {
    await requireAdmin(req);

    const url = parseRequestUrl(req);
    const query = String(url.searchParams.get("search") ?? "").trim();

    const filter: Record<string, unknown> = { role_id: 1 };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ];
    }

    const items = await findMany(users.collectionName, filter, { sort: { created_at: -1 } });
    return jsonResponse(items);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) return error;
    return errorResponse("Gagal memuat admin", 500);
  }
};

export const POST = async (req: Request) => {
  try {
    await requireAdmin(req);

    const body = await parseRequestBody(req);
    const password = String(body.password ?? "").trim();
    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "").trim();
    const name = String(body.name ?? "").trim();

    if (!name) return errorResponse("Nama harus diisi", 400);
    if (!username) return errorResponse("Username harus diisi", 400);
    if (!password) return errorResponse("Password harus diisi", 400);

    const passwordHash = await hash(password, 10);

    const result = await insertOne(users.collectionName, {
      role_id: 1,
      name: sanitizeText(name),
      username: sanitizeText(username),
      email: sanitizeText(email),
      phone: sanitizeText(body.phone),
      password_hash: passwordHash,
      is_active: body.isActive ? body.isActive === "true" || body.isActive === "1" : true,
      is_system: false,
    });

    const created = await findOne(users.collectionName, { id: result.id });
    return jsonResponse(created, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) return error;
    return errorResponse("Gagal membuat admin", 500);
  }
};
