"use client";

import type { Fast } from "@/lib/types";
import { durationMs, formatHM, formatDate, formatClock } from "@/lib/time";

type Props = {
  fasts: Fast[];
  onDelete: (fast: Fast) => void;
};

export default function FastList({ fasts, onDelete }: Props) {
  if (fasts.length === 0) {
    return (
      <div className="empty">
        <div className="empty-emoji">🌙</div>
        <div>No completed fasts yet.</div>
        <div className="faint" style={{ marginTop: 4 }}>
          Start one from the Timer tab.
        </div>
      </div>
    );
  }

  return (
    <div className="fast-list">
      {fasts.map((f) => {
        const dur = f.end_at ? durationMs(f.start_at, f.end_at) : 0;
        const start = new Date(f.start_at);
        return (
          <div className="fast-row" key={f.id}>
            <div className="fast-check" data-met={f.goal_met}>
              {f.goal_met ? "✓" : "·"}
            </div>
            <div className="fast-main">
              <div className="fast-date">{formatDate(start)}</div>
              <div className="fast-sub">
                {formatClock(start)}
                {f.end_at ? ` – ${formatClock(new Date(f.end_at))}` : ""}
              </div>
            </div>
            <div className="fast-dur">
              <strong>{formatHM(dur)}</strong>
              <div className="fast-target">/ {f.target_hours}h</div>
            </div>
            <button
              className="fast-delete"
              aria-label="Delete fast"
              onClick={() => onDelete(f)}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
