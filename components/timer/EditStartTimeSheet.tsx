"use client";

import { useState } from "react";
import { toLocalInputValue } from "@/lib/time";

type Props = {
  startAtIso: string;
  onSave: (newStartIso: string) => Promise<void> | void;
  onClose: () => void;
};

export default function EditStartTimeSheet({ startAtIso, onSave, onClose }: Props) {
  const [value, setValue] = useState(toLocalInputValue(new Date(startAtIso)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      setError("Invalid date");
      return;
    }
    if (d.getTime() > Date.now()) {
      setError("Start time can't be in the future");
      return;
    }
    setSaving(true);
    try {
      await onSave(d.toISOString());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Edit start time</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
          Forgot to press start? Set when this fast actually began.
        </p>
        <input
          className="input"
          type="datetime-local"
          value={value}
          max={toLocalInputValue(new Date())}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <p className="login-error">{error}</p>}
        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary btn-inline" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
