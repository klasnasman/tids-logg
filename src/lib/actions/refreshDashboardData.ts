import { loadClients } from "@lib/stores/clientStore";
import { loadTimeStats } from "@lib/stores/timeStatsStore";

export async function refreshDashboardData(userId: string, selectedMonth: Date) {
  if (!userId) return;
  await loadClients(userId);
  await loadTimeStats(userId, selectedMonth);
}
