"use client";

import { useState } from "react";

type Props = {
  label: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function DeleteConfirm({ label, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Delete this fast?</h3>
        <p className="muted" style={{ marginTop: -8 }}>
          {label} will be permanently removed from your history.
        </p>
        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn-primary btn-inline"
            style={{ background: "var(--danger)", color: "#fff" }}
            onClick={confirm}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
