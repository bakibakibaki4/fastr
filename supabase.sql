-- Fastr — database schema (single-user / PIN-gated build)
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
--
-- The app talks to the database ONLY from the server, using the service-role
-- key, which bypasses RLS. RLS is left enabled with NO policies so that the
-- public/anon role (and anyone with the anon key) is denied all access.
--
-- If you previously ran an older version of this file, first drop the old
-- table (it has no data yet):
--     drop table if exists public.fasts cascade;

create extension if not exists pgcrypto;

create table if not exists public.fasts (
  id           uuid primary key default gen_random_uuid(),
  start_at     timestamptz not null,
  end_at       timestamptz,                        -- NULL = fast in progress
  target_hours numeric(5,2) not null
                 check (target_hours >= 1 and target_hours <= 72),
  created_at   timestamptz not null default now(),

  -- Server-computed so the app can't misreport whether the goal was met.
  goal_met boolean generated always as (
    end_at is not null
    and end_at - start_at >= make_interval(mins => (target_hours * 60)::int)
  ) stored,

  check (end_at is null or end_at >= start_at)
);

-- At most one in-progress fast at a time (single user).
create unique index if not exists fasts_single_active
  on public.fasts ((end_at is null))
  where end_at is null;

-- History queries: newest first.
create index if not exists fasts_start_idx
  on public.fasts (start_at desc);

-- Lock the table down to the service role only. RLS on + no policies = the
-- anon/public API key can read/write nothing; the server (service role)
-- bypasses RLS.
alter table public.fasts enable row level security;
