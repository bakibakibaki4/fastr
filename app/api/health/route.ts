import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Diagnostic endpoint (auth-gated). Reports which env vars are present and
 * whether the database is reachable — WITHOUT revealing any secret values.
 * Safe to leave in; returns only booleans, the (public) URL host, and lengths.
 */
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const env = {
    NEXT_PUBLIC_SUPABASE_URL_present: !!url,
    NEXT_PUBLIC_SUPABASE_URL_host: url ? safeHost(url) : null,
    SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY_len: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    APP_PIN_present: !!process.env.APP_PIN,
    AUTH_SECRET_present: !!process.env.AUTH_SECRET,
  };

  let db: Record<string, unknown>;
  try {
    const s = createAdminClient();
    const { error } = await s.from("fasts").select("id").limit(1);
    db = error ? { ok: false, message: error.message, code: error.code } : { ok: true };
  } catch (e) {
    db = { ok: false, threw: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ env, db });
}

function safeHost(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return "INVALID_URL";
  }
}
