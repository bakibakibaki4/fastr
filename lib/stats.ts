import type { Fast } from "./types";
import { durationMs, localDayKey } from "./time";

export type Stats = {
  currentStreak: number;
  longestStreak: number;
  totalFasts: number;
  avg7dMs: number | null; // average completed-fast length over last 7 days
};

/**
 * Streak = consecutive local days each having at least one goal-met fast,
 * bucketed by the fast's START day (per user's chosen rule). The current
 * streak counts back from today; today not yet having a goal-met fast does
 * NOT break the streak (it's still "in progress") as long as yesterday counts.
 *
 * `completed` should be the list of finished fasts (end_at != null).
 */
export function computeStats(completed: Fast[], now: Date = new Date()): Stats {
  const totalFasts = completed.length;

  // Days (by start date) that had a goal-met fast.
  const metDays = new Set<string>();
  for (const f of completed) {
    if (f.goal_met) metDays.add(localDayKey(new Date(f.start_at)));
  }

  const longestStreak = computeLongestStreak(metDays);
  const currentStreak = computeCurrentStreak(metDays, now);

  // 7-day average of completed fast durations (by start date within window).
  const cutoff = now.getTime() - 7 * 86400_000;
  const recent = completed.filter(
    (f) => f.end_at !== null && new Date(f.start_at).getTime() >= cutoff,
  );
  const avg7dMs =
    recent.length === 0
      ? null
      : recent.reduce((sum, f) => sum + durationMs(f.start_at, f.end_at as string), 0) /
        recent.length;

  return { currentStreak, longestStreak, totalFasts, avg7dMs };
}

function dayKeyFromOffset(base: Date, offsetDays: number): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + offsetDays);
  return localDayKey(d);
}

function computeCurrentStreak(metDays: Set<string>, now: Date): number {
  // Start from today; if today has no met fast, allow starting from yesterday
  // (today is still "in progress"). Then count consecutive days backward.
  let anchor = 0;
  if (!metDays.has(dayKeyFromOffset(now, 0))) {
    if (!metDays.has(dayKeyFromOffset(now, -1))) return 0;
    anchor = -1;
  }
  let streak = 0;
  for (let i = anchor; ; i--) {
    if (metDays.has(dayKeyFromOffset(now, i))) streak++;
    else break;
  }
  return streak;
}

function computeLongestStreak(metDays: Set<string>): number {
  if (metDays.size === 0) return 0;
  const keys = Array.from(metDays).sort(); // YYYY-MM-DD sorts chronologically
  let longest = 1;
  let run = 1;
  for (let i = 1; i < keys.length; i++) {
    if (isNextDay(keys[i - 1], keys[i])) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }
  return longest;
}

function isNextDay(prevKey: string, key: string): boolean {
  const prev = new Date(prevKey + "T00:00:00");
  const next = new Date(prev.getTime() + 86400_000);
  return localDayKey(next) === key;
}
