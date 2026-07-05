/**
 * Time helpers. All stored timestamps are UTC ISO strings; everything here
 * derives from Date.now() and the stored start, so the timer is always
 * recomputed from the source of truth (never from a running counter).
 */

export function elapsedMs(startAtIso: string, now: number = Date.now()): number {
  return Math.max(0, now - new Date(startAtIso).getTime());
}

export function durationMs(startAtIso: string, endAtIso: string): number {
  return Math.max(0, new Date(endAtIso).getTime() - new Date(startAtIso).getTime());
}

export function targetMs(targetHours: number): number {
  return targetHours * 3600_000;
}

/** hh:mm:ss (hours can exceed 24). */
export function formatHMS(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Compact human duration, e.g. "16h 4m". */
export function formatHM(ms: number): string {
  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Local clock time like "19:30". */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "Mon, Jul 5" style local date. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function projectedEnd(startAtIso: string, targetHours: number): Date {
  return new Date(new Date(startAtIso).getTime() + targetMs(targetHours));
}

/** Value in [0,1] for the progress ring. */
export function progressFraction(elapsed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(1, elapsed / target);
}

/** Local YYYY-MM-DD key for a date (used for streak day-bucketing). */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** For datetime-local inputs: format a Date as local "YYYY-MM-DDTHH:mm". */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
