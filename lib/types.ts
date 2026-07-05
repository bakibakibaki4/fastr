export type Fast = {
  id: string;
  user_id: string;
  start_at: string; // UTC ISO
  end_at: string | null; // UTC ISO, null = in progress
  target_hours: number;
  goal_met: boolean; // generated server-side; false while active
  created_at: string;
};
