import { refreshDashboardData } from "@lib/actions/refreshDashboardData";
import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntriesForDate,
  getTimeEntriesForDateRange,
  updateTimeEntry,
} from "@lib/api/timeEntries";
import { authStore } from "@lib/stores/auth/authStore";
import { selectedDateAtom } from "@lib/stores/calendarStore";
import { clientStore, loadClients } from "@lib/stores/clientStore";
import {
  authError as authErrorAtom,
  loading as loadingAtom,
  monthEntries as monthEntriesAtom,
} from "@lib/stores/timeStatsStore";
import { isCalendarModalOpen } from "@lib/stores/UIStore";
import type { TimeEntry } from "@lib/supabase";
import { formatDateString, isHoliday } from "@lib/utils/calendarUtils";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface UseCalendarProps {
  initialSession?: Session | null;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

interface CalendarForm {
  client: string;
  hours: string;
  description: string;
}

export function useCalendar({ initialSession, selectedMonth, onMonthChange }: UseCalendarProps) {
  const $clients = useStore(clientStore);
  const $monthEntries = useStore(monthEntriesAtom);
  const $storeUser = useStore(authStore).user;
  const user = initialSession?.user ?? $storeUser;

  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<TimeEntry[]>([]);
  const selectedDate = useStore(selectedDateAtom);

  const [form, setForm] = useState<CalendarForm>({ client: "", hours: "", description: "" });
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
  const [editingHours, setEditingHours] = useState<Record<string, string>>({});

  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const time = now.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const date = now.toLocaleDateString("sv-SE", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      setCurrentTime(time);
      setCurrentDate(date);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    monthEntriesAtom.set([]);
  }, [selectedMonth]);

  useEffect(() => {
    if (user?.id) {
      loadClients(user.id);
      fetchCalendarEntries();
    }
  }, [selectedMonth, user?.id]);

  async function fetchCalendarEntries() {
    if (!user?.id) return;

    setLoading(true);

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = firstOfMonth.getDay(); // Sunday=0 ... Saturday=6

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - firstWeekday);

    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridStart.getDate() + 41);

    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    try {
      const entries = await getTimeEntriesForDateRange(user.id, formatDate(gridStart), formatDate(gridEnd));
      monthEntriesAtom.set(entries);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
      monthEntriesAtom.set([]);
    } finally {
      setLoading(false);
    }
  }

  const groupAndSumEntriesByClient = (entries: TimeEntry[]) => {
    const grouped = new Map<string, { client_id: string; hours: number; id: string }>();

    for (const entry of entries) {
      const existing = grouped.get(entry.client_id);
      if (existing) {
        existing.hours += entry.hours;
      } else {
        grouped.set(entry.client_id, {
          client_id: entry.client_id,
          hours: entry.hours,
          id: entry.id,
        });
      }
    }

    return Array.from(grouped.values());
  };

  const handleDateClick = async (date: Date) => {
    if (!user?.id) return;

    selectedDateAtom.set(date);
    isCalendarModalOpen.set(true);

    const formatted = formatDateString(date);
    const fetchedEntries = await getTimeEntriesForDate(user.id, formatted);
    setEntriesForSelectedDate(fetchedEntries);

    const holiday = isHoliday(date);
    setHolidayName(holiday?.name ?? null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedDate) return;

    const formatted = formatDateString(selectedDate);
    await createTimeEntry({
      user_id: user.id,
      client_id: form.client,
      hours: parseFloat(form.hours),
      description: form.description || null,
      date: formatted,
    });

    setForm({ client: "", hours: "", description: "" });

    const updated = await getTimeEntriesForDate(user.id, formatted);
    setEntriesForSelectedDate(updated);

    fetchCalendarEntries();

    refreshDashboardData(user.id, selectedMonth);
  };

  const handleDelete = async (entryId: string) => {
    if (!user?.id || !selectedDate) return;

    await deleteTimeEntry(entryId);

    const formatted = formatDateString(selectedDate);
    const updated = await getTimeEntriesForDate(user.id, formatted);
    setEntriesForSelectedDate(updated);

    fetchCalendarEntries();

    refreshDashboardData(user.id, selectedMonth);
  };

  const handleMonthChange = (changeFn: (year: number, month: number) => { year: number; month: number }) => {
    const { year, month } = changeFn(currentYear, currentMonth);
    onMonthChange(new Date(year, month));
  };

  const handleTodayClick = () => {
    const today = new Date();
    onMonthChange(today);
  };

  const handleEditDescriptionChange = (entryId: string, value: string) => {
    setEditingDescriptions((prev) => ({ ...prev, [entryId]: value }));
  };

  const handleEditHoursChange = (entryId: string, value: string) => {
    setEditingHours((prev) => ({ ...prev, [entryId]: value }));
  };

  const updateEntryField = (entryId: string, field: "hours" | "description", value: string): void => {
    if (field === "hours") {
      handleEditHoursChange(entryId, value);
    } else if (field === "description") {
      handleEditDescriptionChange(entryId, value);
    }
  };

  const saveEntryEdit = async (entryId: string, field: "hours" | "description"): Promise<void> => {
    const value = field === "hours" ? editingHours[entryId] : editingDescriptions[entryId];
    if (value === undefined) return;

    if (field === "hours") {
      const parsed = parseFloat(value);
      if (isNaN(parsed) || parsed < 0) return;

      try {
        await updateTimeEntry(entryId, { hours: parsed });
        setEntriesForSelectedDate((entries) => entries.map((e) => (e.id === entryId ? { ...e, hours: parsed } : e)));
        setEditingHours((prev) => {
          const copy = { ...prev };
          delete copy[entryId];
          return copy;
        });
        fetchCalendarEntries();
        await refreshDashboardData(user.id, selectedMonth);
      } catch (err) {
        console.error("Failed to update hours:", err);
      }
    } else {
      try {
        await updateTimeEntry(entryId, { description: value });
        setEntriesForSelectedDate((entries) =>
          entries.map((e) => (e.id === entryId ? { ...e, description: value } : e))
        );
        setEditingDescriptions((prev) => {
          const copy = { ...prev };
          delete copy[entryId];
          return copy;
        });
        fetchCalendarEntries();
        await refreshDashboardData(user.id, selectedMonth);
      } catch (err) {
        console.error("Failed to update description:", err);
      }
    }
  };

  return {
    $clients,
    $monthEntries,
    entriesForSelectedDate,
    selectedDate,
    form,
    groupAndSumEntriesByClient,
    setForm,
    holidayName,
    loading,
    currentYear,
    currentMonth,
    currentTime,
    currentDate,
    handleDateClick,
    handleFormSubmit,
    handleDelete,
    handleMonthChange,
    handleTodayClick,
    refreshDashboardData,
    fetchCalendarEntries,
    updateEntryField,
    saveEntryEdit,
    setEditingHours,
    setEditingDescriptions,
    editingHours,
    editingDescriptions,
  };
}
