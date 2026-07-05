import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "fastr_session";

/**
 * PIN gate: every route requires a valid session cookie except the login page
 * and the login API. No Supabase call here — just a constant-time-ish cookie
 * check, so it runs cheaply on the edge.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  const authed = !!token && !!secret && token === secret;

  const path = request.nextUrl.pathname;
  const isLoginArea = path === "/login" || path.startsWith("/api/login");

  if (!authed && !isLoginArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (authed && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
