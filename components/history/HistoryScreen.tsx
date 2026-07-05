"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteFast } from "@/lib/fasts";
import type { Fast } from "@/lib/types";
import { computeStats } from "@/lib/stats";
import { formatDate } from "@/lib/time";
import StatsBar from "./StatsBar";
import FastList from "./FastList";
import DeleteConfirm from "./DeleteConfirm";

export default function HistoryScreen({ initialFasts }: { initialFasts: Fast[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [fasts, setFasts] = useState<Fast[]>(initialFasts);
  const [pendingDelete, setPendingDelete] = useState<Fast | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only completed fasts appear in history + stats; the active one lives on
  // the Timer tab.
  const completed = useMemo(() => fasts.filter((f) => f.end_at !== null), [fasts]);
  const stats = useMemo(() => computeStats(completed), [completed]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    try {
      await deleteFast(supabase, id);
      setFasts((prev) => prev.filter((f) => f.id !== id));
      setPendingDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
      setPendingDelete(null);
    }
  }

  return (
    <div className="history">
      <h1 className="history-title">History</h1>
      {error && <p className="login-error">{error}</p>}
      <StatsBar stats={stats} />
      <FastList fasts={completed} onDelete={setPendingDelete} />

      {pendingDelete && (
        <DeleteConfirm
          label={`Your ${formatDate(new Date(pendingDelete.start_at))} fast`}
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
