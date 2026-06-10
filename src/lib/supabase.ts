import "server-only";
import { createClient } from "@supabase/supabase-js";

export interface Contribution {
  id: string;
  guest_name: string;
  item: string;
  created_at: string;
  updated_at: string;
}

// All database access happens server-side with the service role key:
// the table has RLS enabled with no policies, so the anon key is useless
// and the PIN gate (enforced in server actions) is the only door.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
