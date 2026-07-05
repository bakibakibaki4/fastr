"use client";

import { useState } from "react";
import { PRESETS, clampHours, MIN_HOURS, MAX_HOURS } from "@/lib/schedules";

type Props = {
  targetHours: number;
  onChange: (hours: number) => void;
  disabled?: boolean;
};

export default function SchedulePicker({ targetHours, onChange, disabled }: Props) {
  const matchedPreset = PRESETS.find((p) => p.fastHours === targetHours);
  const [customOpen, setCustomOpen] = useState(!matchedPreset);
  const [customValue, setCustomValue] = useState(String(targetHours));

  return (
    <div className="sched">
      <div className="sched-grid">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className="sched-chip"
            data-active={!customOpen && p.fastHours === targetHours}
            disabled={disabled}
            onClick={() => {
              setCustomOpen(false);
              onChange(p.fastHours);
            }}
          >
            <span className="sched-chip-label">{p.label}</span>
            <span className="sched-chip-sub">{p.sub}</span>
          </button>
        ))}
        <button
          className="sched-chip"
          data-active={customOpen}
          disabled={disabled}
          onClick={() => {
            setCustomOpen(true);
            setCustomValue(String(targetHours));
          }}
        >
          <span className="sched-chip-label">Custom</span>
          <span className="sched-chip-sub">1–72 h</span>
        </button>
      </div>

      {customOpen && (
        <div className="sched-custom">
          <label className="faint" htmlFor="custom-hours">
            Fasting hours
          </label>
          <div className="sched-custom-row">
            <input
              id="custom-hours"
              className="input"
              type="number"
              inputMode="numeric"
              min={MIN_HOURS}
              max={MAX_HOURS}
              value={customValue}
              disabled={disabled}
              onChange={(e) => setCustomValue(e.target.value)}
              onBlur={() => {
                const h = clampHours(Math.round(Number(customValue)));
                setCustomValue(String(h));
                onChange(h);
              }}
            />
            <span className="muted">hours</span>
          </div>
        </div>
      )}
    </div>
  );
}
