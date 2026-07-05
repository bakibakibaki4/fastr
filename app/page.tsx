import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveFast } from "@/lib/fasts";
import AppShell from "@/components/AppShell";
import TimerScreen from "@/components/timer/TimerScreen";

export const dynamic = "force-dynamic";

export default async function TimerPage() {
  if (!isAuthed()) redirect("/login");

  const active = await getActiveFast(createAdminClient());

  return (
    <AppShell>
      <TimerScreen initialActive={active} />
    </AppShell>
  );
}
