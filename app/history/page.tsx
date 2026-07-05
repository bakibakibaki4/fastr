import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listFasts } from "@/lib/fasts";
import AppShell from "@/components/AppShell";
import HistoryScreen from "@/components/history/HistoryScreen";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fasts = await listFasts(supabase);

  return (
    <AppShell>
      <HistoryScreen initialFasts={fasts} />
    </AppShell>
  );
}
