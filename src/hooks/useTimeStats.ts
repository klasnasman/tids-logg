import { authStore } from "@lib/stores/auth/authStore";
import {
  allEntries as allEntriesAtom,
  authError as authErrorAtom,
  loading as loadingAtom,
  loadTimeStats,
  monthEntries as monthEntriesAtom,
  timeStatsStore,
} from "@lib/stores/timeStatsStore";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

export function useTimeStats(initialSession?: Session | null, selectedMonth?: Date) {
  const $stats = useStore(timeStatsStore);
  const $loading = useStore(loadingAtom);
  const $authError = useStore(authErrorAtom);
  const $monthEntries = useStore(monthEntriesAtom);
  const $allEntries = useStore(allEntriesAtom);

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
    $allEntries,
  };
}
