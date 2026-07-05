import type { SupabaseClient } from "@supabase/supabase-js";
import type { Fast } from "./types";

/**
 * Data access for the single-user (PIN-gated) app. All functions take the
 * server-side admin client; the browser never calls these directly — it goes
 * through the server actions in app/actions.ts.
 */

const COLS = "id, start_at, end_at, target_hours, goal_met, created_at";

/** The single in-progress fast (end_at IS NULL), or null. */
export async function getActiveFast(supabase: SupabaseClient): Promise<Fast | null> {
  const { data, error } = await supabase
    .from("fasts")
    .select(COLS)
    .is("end_at", null)
    .order("start_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Fast) ?? null;
}

/** All fasts, newest first. */
export async function listFasts(supabase: SupabaseClient): Promise<Fast[]> {
  const { data, error } = await supabase
    .from("fasts")
    .select(COLS)
    .order("start_at", { ascending: false });
  if (error) throw error;
  return (data as Fast[]) ?? [];
}

/** Start a fast. The DB partial-unique index prevents a second active fast. */
export async function startFast(
  supabase: SupabaseClient,
  targetHours: number,
  startAtIso: string,
): Promise<Fast> {
  const { data, error } = await supabase
    .from("fasts")
    .insert({ start_at: startAtIso, target_hours: targetHours })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as Fast;
}

export async function endFast(
  supabase: SupabaseClient,
  id: string,
  endAtIso: string,
): Promise<Fast> {
  const { data, error } = await supabase
    .from("fasts")
    .update({ end_at: endAtIso })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data as Fast;
}

/** Edit the start time of the active fast (e.g. user forgot to press start). */
export async function updateStartTime(
  supabase: SupabaseClient,
  id: string,
  startAtIso: string,
): Promise<Fast> {
  const { data, error } = await supabase
    .from("fasts")
    .update({ start_at: startAtIso })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data as Fast;
}

export async function deleteFast(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("fasts").delete().eq("id", id);
  if (error) throw error;
}
