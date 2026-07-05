import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listFasts } from "@/lib/fasts";
import AppShell from "@/components/AppShell";
import HistoryScreen from "@/components/history/HistoryScreen";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!isAuthed()) redirect("/login");

  const fasts = await listFasts(createAdminClient());

  return (
    <AppShell>
      <HistoryScreen initialFasts={fasts} />
    </AppShell>
  );
}
