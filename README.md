# Fastr — Intermittent Fasting Timer

A calm, mobile-first intermittent fasting timer. Next.js (App Router) + TypeScript
+ Supabase (auth + Postgres). Designed for a ~380px phone viewport; desktop is
centered and usable but not the focus.

## Features

- **One-tap fasting timer** with presets (16:8, 18:6, 20:4, OMAD 23:1) and a custom
  1–72h option.
- **Live elapsed time** (hh:mm:ss), progress ring, target, and projected end clock
  time. The timer is always recomputed from the stored UTC start timestamp, so it
  survives reloads and phone lock/unlock.
- **Goal-reached state** — the ring shifts to amber and the timer keeps running
  until you end the fast.
- **Edit start time** if you forgot to press start.
- **Server-side active fast** — open the app on another device and the running
  timer is there.
- **History + stats** — reverse-chronological list with a ✓ when the goal was met,
  plus current streak, longest streak, total fasts, and 7-day average.
- **Delete** any history entry (with a soft confirm).
- **Magic-link auth only** — no passwords, no signup forms.
- Dark-mode-first; respects `prefers-color-scheme`.

## 1. Create the database

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of
[`supabase.sql`](./supabase.sql), and run it. This creates the `fasts` table, the
"one active fast per user" index, and Row Level Security policies so each user can
only read/write their own rows.

## 2. Configure auth

In Supabase → **Authentication → Providers → Email**, make sure **Email** is
enabled (magic links are on by default). Then under **Authentication → URL
Configuration**:

- Set **Site URL** to your app URL (`http://localhost:3000` for local dev, your
  Vercel URL in production).
- Add both to **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from Supabase →
**Project Settings → API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Both are safe to expose in the browser — Row Level Security is what protects your
data.

## 4. Run locally

Requires **Node 18+**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, enter your email, and click the magic link.

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo (framework auto-detects as Next.js).
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`).
4. Deploy.
5. Back in Supabase → **Authentication → URL Configuration**, set the **Site URL**
   to your Vercel URL and add `https://your-app.vercel.app/auth/callback` to the
   **Redirect URLs**.

## Project structure

```
app/
  layout.tsx            root layout, viewport + theme
  page.tsx              Timer screen (auth-gated)
  history/page.tsx      History screen (auth-gated)
  login/page.tsx        magic-link sign-in
  auth/callback/route   exchanges magic-link code for a session
  auth/signout/route    sign out
middleware.ts           refreshes session + gates routes
components/
  timer/                timer UI (ring, schedule picker, sheets)
  history/              stats bar, list, delete confirm
lib/
  supabase/             browser + server + middleware clients
  fasts.ts              data access (start/end/edit/list/delete)
  time.ts               UTC-safe time math + formatting
  stats.ts              streak + averages
  schedules.ts          preset definitions
supabase.sql            schema + RLS (run once in Supabase)
```

## Notes

- All timestamps are stored as UTC (`timestamptz`) and rendered in the device's
  local timezone.
- `goal_met` is a generated column computed by Postgres, so history/stats never
  depend on the client to decide whether a goal was met.
- Streaks count by the fast's **start** date (a fast that starts today counts
  toward today); today not yet having a goal-met fast does not break the streak.
