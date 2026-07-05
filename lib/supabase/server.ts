import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the Supabase auth cookies. In pure Server Components the cookie
 * store is read-only, so writes are wrapped in try/catch (session refresh is
 * handled by middleware).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without a mutable cookie store —
            // safe to ignore; middleware keeps the session fresh.
          }
        },
      },
    },
  );
}
