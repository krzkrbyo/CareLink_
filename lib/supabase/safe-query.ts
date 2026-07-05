import type { PostgrestError } from "@supabase/supabase-js";

export async function selectOrEmpty<TRow>(
  query: PromiseLike<{ data: TRow[] | null; error: PostgrestError | null }>
): Promise<TRow[]> {
  const { data, error } = await query;
  if (error) {
    console.error("[CareLink] Supabase query failed:", error.message);
    return [];
  }
  return data ?? [];
}
