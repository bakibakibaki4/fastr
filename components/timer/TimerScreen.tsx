"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  startFast,
  endFast,
  updateStartTime,
  getActiveFast,
} from "@/lib/fasts";
import type { Fast } from "@/lib/types";
import {
  elapsedMs as calcElapsed,
  targetMs,
  formatHMS,
  formatClock,
  formatDate,
  projectedEnd,
  progressFraction,
} from "@/lib/time";
import ProgressRing from "./ProgressRing";
import SchedulePicker from "./SchedulePicker";
import EditStartTimeSheet from "./EditStartTimeSheet";
import EndFastSheet from "./EndFastSheet";

export default function TimerScreen({ initialActive }: { initialActive: Fast | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [active, setActive] = useState<Fast | null>(initialActive);
  const [targetHours, setTargetHours] = useState(16);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [editingStart, setEditingStart] = useState(false);
  const [endingFast, setEndingFast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tick once per second while a fast is active. Elapsed is always recomputed
  // from start_at, so reloads / lock-unlock stay accurate.
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Re-sync active fast when the tab regains focus (cross-device consistency).
  const supaRef = useRef(supabase);
  useEffect(() => {
    function onFocus() {
      getActiveFast(supaRef.current)
        .then((f) => setActive(f))
        .catch(() => {});
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const fast = await startFast(supabase, targetHours, new Date().toISOString());
      setActive(fast);
    } catch (e) {
      // Likely the partial-unique index (a fast already running elsewhere).
      const refreshed = await getActiveFast(supabase).catch(() => null);
      if (refreshed) setActive(refreshed);
      else setError(e instanceof Error ? e.message : "Could not start fast");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnd() {
    if (!active) return;
    setBusy(true);
    try {
      await endFast(supabase, active.id, new Date().toISOString());
      setActive(null);
      setEndingFast(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not end fast");
    } finally {
      setBusy(false);
    }
  }

  async function handleEditStart(newStartIso: string) {
    if (!active) return;
    const updated = await updateStartTime(supabase, active.id, newStartIso);
    setActive(updated);
  }

  return (
    <div className="timer">
      <header className="timer-header">
        <div className="brand">
          <span className="brand-dot" />
          Fastr
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn-ghost" type="submit" aria-label="Sign out">
            Sign out
          </button>
        </form>
      </header>

      {error && <p className="login-error">{error}</p>}

      {active ? (
        <ActiveFast
          active={active}
          now={now}
          busy={busy}
          onEndRequest={() => setEndingFast(true)}
          onEditStart={() => setEditingStart(true)}
        />
      ) : (
        <IdleState
          targetHours={targetHours}
          onChangeTarget={setTargetHours}
          onStart={handleStart}
          busy={busy}
        />
      )}

      {editingStart && active && (
        <EditStartTimeSheet
          startAtIso={active.start_at}
          onSave={handleEditStart}
          onClose={() => setEditingStart(false)}
        />
      )}

      {endingFast && active && (
        <EndFastSheet
          elapsedMs={calcElapsed(active.start_at, now)}
          targetHours={active.target_hours}
          goalReached={calcElapsed(active.start_at, now) >= targetMs(active.target_hours)}
          onConfirm={handleEnd}
          onClose={() => setEndingFast(false)}
        />
      )}
    </div>
  );
}

function ActiveFast({
  active,
  now,
  busy,
  onEndRequest,
  onEditStart,
}: {
  active: Fast;
  now: number;
  busy: boolean;
  onEndRequest: () => void;
  onEditStart: () => void;
}) {
  const elapsed = calcElapsed(active.start_at, now);
  const target = targetMs(active.target_hours);
  const goalReached = elapsed >= target;
  const fraction = progressFraction(elapsed, target);
  const end = projectedEnd(active.start_at, active.target_hours);

  return (
    <div className="active">
      <div className="active-status" data-goal={goalReached}>
        {goalReached ? "Goal reached — keep going if you like" : "Fasting"}
      </div>

      <ProgressRing fraction={fraction} goalReached={goalReached}>
        <div className="ring-elapsed">{formatHMS(elapsed)}</div>
        <div className="ring-target faint">
          {goalReached ? "past" : "of"} {active.target_hours}h target
        </div>
        <div className="ring-pct" data-goal={goalReached}>
          {Math.floor(fraction * 100)}%
        </div>
      </ProgressRing>

      <div className="active-meta card">
        <div>
          <span className="faint">Started</span>
          <strong>{formatClock(new Date(active.start_at))}</strong>
        </div>
        <div className="active-meta-sep" />
        <div>
          <span className="faint">Ends at</span>
          <strong style={{ color: goalReached ? "var(--goal)" : undefined }}>
            {formatClock(end)}
          </strong>
        </div>
      </div>

      <button
        className="btn-primary"
        data-variant={goalReached ? "goal" : "stop"}
        onClick={onEndRequest}
        disabled={busy}
      >
        End fast
      </button>
      <button className="btn-ghost btn-block" onClick={onEditStart} disabled={busy}>
        Edit start time
      </button>
    </div>
  );
}

function IdleState({
  targetHours,
  onChangeTarget,
  onStart,
  busy,
}: {
  targetHours: number;
  onChangeTarget: (h: number) => void;
  onStart: () => void;
  busy: boolean;
}) {
  // Live "ends at" preview: recompute each minute so it stays current while
  // the user lingers on the start screen.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const previewEnd = new Date(now + targetMs(targetHours));
  const crossesDay = previewEnd.getDate() !== new Date(now).getDate();

  return (
    <div className="idle">
      <div className="idle-hero">
        <div className="idle-title">Ready to fast</div>
        <div className="muted">Pick a schedule and start when you&apos;re ready.</div>
      </div>

      <SchedulePicker targetHours={targetHours} onChange={onChangeTarget} disabled={busy} />

      <div className="idle-preview">
        <span className="faint">If you start now, ends at</span>
        <strong>
          {formatClock(previewEnd)}
          {crossesDay ? ` · ${formatDate(previewEnd)}` : ""}
        </strong>
      </div>

      <button className="btn-primary" onClick={onStart} disabled={busy}>
        {busy ? "Starting…" : `Start ${targetHours}h fast`}
      </button>
    </div>
  );
}
