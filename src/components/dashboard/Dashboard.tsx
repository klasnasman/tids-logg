import React, { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import Calendar from "@components/calendar/CalendarView";
import TimeStatsView from "@components/calendar/TimeStatsView";
import ClientView from "@components/calendar/ClientView";
import { authStore, initAuth } from "@lib/stores/auth/authStore";
import { useStore } from "@nanostores/react";
import { isSidebarOpen } from "@lib/stores/calendarUIStore";

type Props = {
  initialSession: Session | null;
  accessToken?: string;
  refreshToken?: string;
};

const Dashboard: React.FC<Props> = ({ initialSession, accessToken, refreshToken }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [session, setSession] = React.useState<Session | null>(initialSession);
  
  const $isSidebarOpen = useStore(isSidebarOpen);

useEffect(() => {
  async function initializeAuth() {
    if (!accessToken || !refreshToken) {
      return;
    }

    if (!authStore.get()?.session) {
      await initAuth(accessToken, refreshToken);
      const { session: updatedSession } = authStore.get();
      setSession(updatedSession);
    }
  }

  initializeAuth();
}, [accessToken, refreshToken]);

  return (
    <div className="dashboard">
      <div className="dashboard-calendar">
        <Calendar initialSession={session} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
      </div>

      <div className={`dashboard-sidebar ${$isSidebarOpen ? "open" : "closed"}`}>
        <TimeStatsView initialSession={session} selectedMonth={selectedMonth} />
        <ClientView initialSession={session} selectedMonth={selectedMonth} />
      </div>
    </div>
  );
};

export default Dashboard;
