export type Preset = {
  id: string;
  label: string;
  /** Fasting window in hours. */
  fastHours: number;
  /** Short descriptor, e.g. "16h fast · 8h eat". */
  sub: string;
};

export const PRESETS: Preset[] = [
  { id: "16:8", label: "16:8", fastHours: 16, sub: "16h fast · 8h eat" },
  { id: "18:6", label: "18:6", fastHours: 18, sub: "18h fast · 6h eat" },
  { id: "20:4", label: "20:4", fastHours: 20, sub: "20h fast · 4h eat" },
  { id: "omad", label: "OMAD", fastHours: 23, sub: "23h fast · 1 meal" },
];

export const MIN_HOURS = 1;
export const MAX_HOURS = 72;

export function clampHours(h: number): number {
  if (Number.isNaN(h)) return MIN_HOURS;
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, h));
}
