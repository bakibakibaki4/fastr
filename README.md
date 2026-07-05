# Fastr — Intermittent Fasting Timer

A calm, mobile-first intermittent fasting timer. Next.js (App Router) + TypeScript
+ Supabase (Postgres). Single-user, protected by a PIN. Designed for a ~380px
phone viewport; desktop is centered and usable but not the focus.

## Features

- **One-tap fasting timer** with presets (16:8, 18:6, 20:4, OMAD 23:1) and a custom
  1–72h option.
- **Live elapsed time** (hh:mm:ss), progress ring, target, and projected end clock
  time. The timer is always recomputed from the stored UTC start timestamp, so it
  survives reloads and phone lock/unlock.
- **"Ends at" preview** on the start screen before you even begin.
- **Goal-reached state** — the ring shifts to amber and the timer keeps running
  until you end the fast.
- **Edit start time** if you forgot to press start.
- **Server-side active fast** — open the app on another device and the running
  timer is there.
- **History + stats** — reverse-chronological list with a ✓ when the goal was met,
  plus current streak, longest streak, total fasts, and 7-day average.
- **Delete** any history entry (with a soft confirm).
- **PIN gate** — one passcode unlocks the app; no email, no accounts.
- Dark-mode-first; respects `prefers-color-scheme`.

## How access works (important)

This is a single-user app. The browser **never** talks to Supabase directly — all
database access happens on the server using the **service-role key** (a secret,
server-only env var). A single **PIN** unlocks a signed, HttpOnly session cookie
that gates every route and server action. Because the database is only reachable
through the server, and the service-role key never reaches the browser, your data
is sealed off from the public even though there are no user accounts.

## 1. Create the database

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of
[`supabase.sql`](./supabase.sql), and run it. This creates the `fasts` table and
its indexes, and enables Row Level Security with no policies (so the public API key
can't touch anything; only the server's service-role key can).

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase → Project Settings → API → "service_role" (SECRET — server only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# The passcode you type to unlock the app
APP_PIN=1234

# Random secret for signing the session cookie. Generate with: openssl rand -hex 32
AUTH_SECRET=your-long-random-secret
```

⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `AUTH_SECRET` are **not** prefixed with
`NEXT_PUBLIC` — they must never be exposed to the browser. Don't commit
`.env.local` (it's gitignored).

## 3. Run locally

Requires **Node 18+**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, enter your PIN, and you're in.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo (auto-detects as Next.js).
3. Under **Environment Variables**, add all four from your `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_PIN`, `AUTH_SECRET`.
4. Deploy.

That's it — no auth URLs to configure (there's no magic-link redirect anymore).

## Project structure

```
app/
  layout.tsx            root layout, viewport + theme
  page.tsx              Timer screen (PIN-gated)
  history/page.tsx      History screen (PIN-gated)
  login/page.tsx        PIN entry
  api/login/route.ts    verifies PIN, sets session cookie
  auth/signout/route.ts clears session cookie
  actions.ts            server actions (only path from browser to DB)
middleware.ts           checks the session cookie, gates routes
components/
  timer/                timer UI (ring, schedule picker, sheets)
  history/              stats bar, list, delete confirm
lib/
  auth.ts               session-cookie check
  supabase/admin.ts     server-only service-role client
  fasts.ts              data access (start/end/edit/list/delete)
  time.ts               UTC-safe time math + formatting
  stats.ts              streak + averages
  schedules.ts          preset definitions
supabase.sql            schema (run once in Supabase)
```

## Notes

- All timestamps are stored as UTC (`timestamptz`) and rendered in the device's
  local timezone.
- `goal_met` is a generated column computed by Postgres, so history/stats never
  depend on the client to decide whether a goal was met.
- Streaks count by the fast's **start** date (a fast that starts today counts
  toward today); today not yet having a goal-met fast does not break the streak.
- To change your PIN, edit `APP_PIN` (locally in `.env.local`, and in Vercel's
  environment variables for production).
