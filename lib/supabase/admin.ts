import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. It bypasses RLS and
 * must NEVER be imported into client components or exposed to the browser
 * (the key is a non-public env var). All database access goes through here,
 * behind the PIN gate, so the database is never reachable from the browser.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
