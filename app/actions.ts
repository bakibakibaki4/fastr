"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getActiveFast,
  listFasts,
  startFast,
  endFast,
  updateStartTime,
  deleteFast,
} from "@/lib/fasts";
import type { Fast } from "@/lib/types";

/**
 * Server actions are the only way the browser touches the database. Every one
 * re-checks the PIN session (defense in depth on top of middleware) before
 * using the service-role client.
 */
function guard() {
  if (!isAuthed()) throw new Error("Not authorized");
  return createAdminClient();
}

/** Bust the client Router Cache for both screens after a mutation. */
function revalidateScreens() {
  revalidatePath("/");
  revalidatePath("/history");
}

export async function getActiveFastAction(): Promise<Fast | null> {
  return getActiveFast(guard());
}

export async function listFastsAction(): Promise<Fast[]> {
  return listFasts(guard());
}

export async function startFastAction(
  targetHours: number,
  startAtIso: string,
): Promise<Fast> {
  const fast = await startFast(guard(), targetHours, startAtIso);
  revalidateScreens();
  return fast;
}

export async function endFastAction(id: string, endAtIso: string): Promise<Fast> {
  const fast = await endFast(guard(), id, endAtIso);
  revalidateScreens();
  return fast;
}

export async function updateStartAction(
  id: string,
  startAtIso: string,
): Promise<Fast> {
  const fast = await updateStartTime(guard(), id, startAtIso);
  revalidateScreens();
  return fast;
}

export async function deleteFastAction(id: string): Promise<void> {
  await deleteFast(guard(), id);
  revalidateScreens();
}
