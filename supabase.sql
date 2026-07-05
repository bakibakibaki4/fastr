-- Fastr — database schema + Row Level Security
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).

create extension if not exists pgcrypto;

create table if not exists public.fasts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  start_at     timestamptz not null,
  end_at       timestamptz,                        -- NULL = fast in progress
  target_hours numeric(5,2) not null
                 check (target_hours >= 1 and target_hours <= 72),
  created_at   timestamptz not null default now(),

  -- Server-computed so the client can never lie about whether the goal was met.
  goal_met boolean generated always as (
    end_at is not null
    and end_at - start_at >= make_interval(mins => (target_hours * 60)::int)
  ) stored,

  check (end_at is null or end_at >= start_at)
);

-- At most one in-progress fast per user.
create unique index if not exists fasts_one_active_per_user
  on public.fasts (user_id)
  where end_at is null;

-- History queries: newest first, per user.
create index if not exists fasts_user_start_idx
  on public.fasts (user_id, start_at desc);

-- Row Level Security: users can only read/write their own rows.
alter table public.fasts enable row level security;

drop policy if exists "read own fasts"   on public.fasts;
drop policy if exists "insert own fasts" on public.fasts;
drop policy if exists "update own fasts" on public.fasts;
drop policy if exists "delete own fasts" on public.fasts;

create policy "read own fasts"
  on public.fasts for select using (auth.uid() = user_id);

create policy "insert own fasts"
  on public.fasts for insert with check (auth.uid() = user_id);

create policy "update own fasts"
  on public.fasts for update using (auth.uid() = user_id)
                           with check (auth.uid() = user_id);

create policy "delete own fasts"
  on public.fasts for delete using (auth.uid() = user_id);
