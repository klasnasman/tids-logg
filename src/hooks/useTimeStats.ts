import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  timeStatsStore,
  loading as loadingAtom,
  authError as authErrorAtom,
  monthEntries as monthEntriesAtom,
  loadTimeStats,
} from "@lib/stores/timeStatsStore";
import type { Session } from "@supabase/supabase-js";
import { authStore } from "@lib/stores/auth/authStore";

export function useTimeStats(initialSession?: Session | null, selectedMonth?: Date) {

  const $stats = useStore(timeStatsStore);
  const $loading = useStore(loadingAtom);
  const $authError = useStore(authErrorAtom);
  const $monthEntries = useStore(monthEntriesAtom);

  useEffect(() => {
    const userId = initialSession?.user?.id ?? authStore.get().user?.id;

    if (!userId) {
      authErrorAtom.set("Not logged in.");
      loadingAtom.set(false);
      return;
    }

    if (selectedMonth) {
      authErrorAtom.set(null);
      loadTimeStats(userId, selectedMonth);
    }
  }, [initialSession, selectedMonth]);

  return {
    $stats,
    $loading,
    $authError,
    $monthEntries,
  };
}
