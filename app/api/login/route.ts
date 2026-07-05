import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { pin } = await request.json().catch(() => ({ pin: "" }));

  const expected = process.env.APP_PIN;
  const secret = process.env.AUTH_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { ok: false, error: "Server not configured (APP_PIN / AUTH_SECRET)." },
      { status: 500 },
    );
  }

  if (typeof pin !== "string" || pin !== expected) {
    return NextResponse.json({ ok: false, error: "Wrong PIN" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // ~1 year
  });
  return res;
}
