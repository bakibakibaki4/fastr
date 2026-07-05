import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveFast } from "@/lib/fasts";
import AppShell from "@/components/AppShell";
import TimerScreen from "@/components/timer/TimerScreen";

export const dynamic = "force-dynamic";

export default async function TimerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const active = await getActiveFast(supabase);

  return (
    <AppShell>
      <TimerScreen initialActive={active} />
    </AppShell>
  );
}
