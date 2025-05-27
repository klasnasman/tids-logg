import Calendar from "@components/calendar/CalendarView";
import ClientView from "@components/calendar/ClientView";
import TimeStatsView from "@components/calendar/TimeStatsView";
import { authStore, initAuth } from "@lib/stores/auth/authStore";
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

  const $isSidebarOpen = useStore(isSidebarOpen);

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [session, setSession] = React.useState<Session | null>(initialSession);
  
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
