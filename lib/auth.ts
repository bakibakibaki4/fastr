import { cookies } from "next/headers";

export const SESSION_COOKIE = "fastr_session";

/** True if the request carries a valid PIN-session cookie. Server-only. */
export function isAuthed(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  return !!token && !!secret && token === secret;
}
