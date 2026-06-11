import { createClient } from "@supabase/supabase-js";
import "server-only";
import { Database } from "../../database.types";

// Database access uses the publishable key, still server-side only.
// RLS policies allow select/insert/update for anon — the PIN gate
// (enforced in server actions) is the only door. No real security by design.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
