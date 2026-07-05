"use client";

import type { Stats } from "@/lib/stats";
import { formatHM } from "@/lib/time";

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="stats-grid">
      <div className="stat">
        <div className="stat-value accent">
          {stats.currentStreak}
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {" "}
            day{stats.currentStreak === 1 ? "" : "s"}
          </span>
        </div>
        <div className="stat-label">Current streak</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.longestStreak}</div>
        <div className="stat-label">Longest streak</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.totalFasts}</div>
        <div className="stat-label">Total fasts</div>
      </div>
      <div className="stat">
        <div className="stat-value">
          {stats.avg7dMs === null ? "—" : formatHM(stats.avg7dMs)}
        </div>
        <div className="stat-label">Avg (last 7 days)</div>
      </div>
    </div>
  );
}
