import Calendar from "@components/calendar/CalendarView";
import ClientView from "@components/calendar/ClientView";
import TimeStatsView from "@components/calendar/TimeStatsView";
import { authStore, initAuth, setSession } from "@lib/stores/auth/authStore";
import { selectedMonthAtom, setSelectedMonth } from "@lib/stores/calendarStore";
import { isSidebarOpen } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";

type Props = {
  initialSession: Session | null;
  accessToken?: string;
  refreshToken?: string;
};

const Dashboard: React.FC<Props> = ({ initialSession, accessToken, refreshToken }) => {

  const $auth = useStore(authStore);
  const session = $auth.session;
  const selectedMonth = useStore(selectedMonthAtom);
  const $isSidebarOpen = useStore(isSidebarOpen);
  
  useEffect(() => {
    async function initializeAuth() {
      if (!accessToken || !refreshToken) {
        setSession(initialSession);
        return;
      }

      if (!authStore.get().session) {
        await initAuth(accessToken, refreshToken);
      }
    }

    initializeAuth();
  }, [accessToken, refreshToken, initialSession]);

  return (
    <div className="dashboard">
      <div className="dashboard-calendar">
        <Calendar
          initialSession={session}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>
      <div className={`dashboard-sidebar ${$isSidebarOpen ? "open" : "closed"}`}>
        <TimeStatsView initialSession={session} selectedMonth={selectedMonth} />
        <ClientView initialSession={session} selectedMonth={selectedMonth} />
      </div>
    </div>
  );
};

export default Dashboard;
