import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Every store instance only needs to change these two env vars
// (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) to point
// at its own Supabase project. Nothing else in the codebase changes.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
