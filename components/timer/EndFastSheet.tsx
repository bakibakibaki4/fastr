"use client";

import { useState } from "react";
import { formatHM } from "@/lib/time";

type Props = {
  elapsedMs: number;
  targetHours: number;
  goalReached: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function EndFastSheet({
  elapsedMs,
  targetHours,
  goalReached,
  onConfirm,
  onClose,
}: Props) {
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>End this fast?</h3>
        <div className="end-summary">
          <div>
            <span className="faint">Fasted</span>
            <strong>{formatHM(elapsedMs)}</strong>
          </div>
          <div>
            <span className="faint">Target</span>
            <strong>{targetHours}h</strong>
          </div>
          <div>
            <span className="faint">Goal</span>
            <strong style={{ color: goalReached ? "var(--goal)" : "var(--text-dim)" }}>
              {goalReached ? "Met ✓" : "Not met"}
            </strong>
          </div>
        </div>
        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Keep fasting
          </button>
          <button
            className="btn-primary btn-inline"
            data-variant="stop"
            onClick={confirm}
            disabled={saving}
          >
            {saving ? "Saving…" : "End & save"}
          </button>
        </div>
      </div>
    </div>
  );
}
