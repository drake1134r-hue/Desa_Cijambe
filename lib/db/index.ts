import { createClient } from "@supabase/supabase-js";

type FindOptions = {
  sort?: Record<string, 1 | -1 | "asc" | "desc">;
  limit?: number;
  skip?: number;
};

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not defined.");
  }

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not defined. Set this to your Supabase service role key, not a public or anon key."
    );
  }

  if (typeof supabaseKey === "string" && /^(sb_publishable_|sb_anon_)/.test(supabaseKey)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY appears to be a publishable/anonymous key. Replace it with your Supabase service role key from the Supabase dashboard."
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

function normalizeSortDirection(value: 1 | -1 | "asc" | "desc") {
  return value === 1 || value === "asc";
}

function applyFilter(query: any, filter: Record<string, any> = {}) {
  for (const [key, value] of Object.entries(filter)) {
    if (key === "$or" && Array.isArray(value)) {
      const conditions = value
        .map((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            return Object.entries(item)
              .map(([subKey, subValue]) => {
                if (subValue && typeof subValue === "object" && !Array.isArray(subValue)) {
                  if ("$ne" in subValue) {
                    return `${subKey}.neq.${String(subValue.$ne)}`;
                  }
                  if ("$regex" in subValue) {
                    return `${subKey}.ilike.%${String(subValue.$regex)}%`;
                  }
                }
                return `${subKey}.eq.${String(subValue)}`;
              })
              .join(",");
          }
          return "";
        })
        .filter(Boolean)
        .join(",");

      if (conditions) {
        query = query.or(conditions);
      }
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("$ne" in value) {
        query = query.neq(key, value.$ne);
        continue;
      }
      if ("$regex" in value) {
        query = query.ilike(key, `%${String(value.$regex)}%`);
        continue;
      }
      if ("$in" in value && Array.isArray(value.$in)) {
        query = query.in(key, value.$in);
        continue;
      }
    }

    query = query.eq(key, value);
  }

  return query;
}

export async function findOne<T = Record<string, any>>(
  tableName: string,
  filter: Record<string, any>
): Promise<T | null> {
  const supabase = getSupabaseClient();
  let query = supabase.from(tableName).select("*").maybeSingle();
  query = applyFilter(query, filter);

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase findOne error on ${tableName}:`, error);
    throw error;
  }

  return data as T | null;
}

export async function findMany<T = Record<string, any>>(
  tableName: string,
  filter: Record<string, any> = {},
  options: FindOptions = {}
): Promise<T[]> {
  const supabase = getSupabaseClient();
  let query: any = supabase.from(tableName).select("*");
  query = applyFilter(query, filter);

  if (options.sort) {
    for (const [key, direction] of Object.entries(options.sort)) {
      query = query.order(key, { ascending: normalizeSortDirection(direction) });
    }
  }

  if (typeof options.skip === "number" && typeof options.limit === "number") {
    query = query.range(options.skip, options.skip + options.limit - 1);
  } else if (typeof options.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase findMany error on ${tableName}:`, error);
    throw error;
  }

  return (data ?? []) as T[];
}

export async function insertOne(
  tableName: string,
  document: Record<string, any>
) {
  const payload = {
    ...document,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  const table = supabase.from(tableName as any) as any;
  const { data, error } = await table
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    console.error(`Supabase insertOne error on ${tableName}:`, error);
    throw new Error(error?.message ?? String(error));
  }

  return {
    insertedId: data?.id ?? null,
    id: data?.id ?? null,
  };
}

export async function updateOne(
  tableName: string,
  filter: Record<string, any>,
  update: Record<string, any>
) {
  const payload = {
    ...update,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  const table = supabase.from(tableName as any) as any;
  const { error } = await table
    .update(payload)
    .match(filter);

  if (error) {
    console.error(`Supabase updateOne error on ${tableName}:`, error);
    throw new Error(error?.message ?? String(error));
  }

  return { success: true };
}

export async function deleteOne(
  tableName: string,
  filter: Record<string, any>
) {
  const supabase = getSupabaseClient();
  const table = supabase.from(tableName as any) as any;
  const { error } = await table.delete().match(filter);

  if (error) {
    console.error(`Supabase deleteOne error on ${tableName}:`, error);
    throw new Error(error?.message ?? String(error));
  }

  return { success: true };
}

export async function countDocuments(
  tableName: string,
  filter: Record<string, any> = {}
) {
  const supabase = getSupabaseClient();
  const table = supabase.from(tableName as any) as any;
  let query: any = table.select("*", { count: "exact", head: true });
  query = applyFilter(query, filter);

  const { count, error } = await query;
  if (error) {
    console.error(`Supabase countDocuments error on ${tableName}:`, error);
    throw error;
  }

  return count ?? 0;
}
