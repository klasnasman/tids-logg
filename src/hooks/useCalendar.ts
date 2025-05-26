import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { refreshDashboardData } from "@lib/actions/refreshDashboardData";
import { authStore } from "@lib/stores/auth/authStore";
import { clientStore, loadClients } from "@lib/stores/clientStore";
import {
  loading as loadingAtom,
  authError as authErrorAtom,
  monthEntries as monthEntriesAtom,
} from "@lib/stores/timeStatsStore";
import type { Session } from "@supabase/supabase-js";
import type { TimeEntry } from "@lib/supabase";
import { formatDateString, isHoliday } from "@lib/utils/calendar";
import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntriesForDate,
  getTimeEntriesForMonth,
  updateTimeEntry,
} from "@lib/api/timeEntries";

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
  const storeUser = useStore(authStore).user;
  const user = initialSession?.user ?? storeUser;
  const $monthEntries = useStore(monthEntriesAtom);  

  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [form, setForm] = useState<CalendarForm>({ client: "", hours: "", description: "" });
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
  const [editingHours, setEditingHours] = useState<Record<string, string>>({});

  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const closeModal = () => setModalOpen(false);

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

  // Clear month entries when month changes
  useEffect(() => {
    monthEntriesAtom.set([]);
  }, [selectedMonth]);

  // Load clients and fetch entries when year/month/user changes
  useEffect(() => {
    if (user?.id) {
      loadClients(user.id);
      fetchMonthEntries();
    }
  }, [selectedMonth, user?.id]);

  const fetchMonthEntries = async () => {
    if (!user?.id) return;

    loadingAtom.set(true);
    try {
      const monthData = await getTimeEntriesForMonth(user.id, currentYear, currentMonth + 1);
      monthEntriesAtom.set(monthData);
    } catch (error) {
      console.error("Error fetching month entries:", error);
    } finally {
      loadingAtom.set(false);
    }
  };

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

    setSelectedDate(date);
    setModalOpen(true);

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

    fetchMonthEntries();

    refreshDashboardData(user.id, selectedMonth);
  };

  const handleDelete = async (entryId: string) => {
    if (!user?.id || !selectedDate) return;

    await deleteTimeEntry(entryId);

    // Refresh entries for the selected date
    const formatted = formatDateString(selectedDate);    
    const updated = await getTimeEntriesForDate(user.id, formatted);
    setEntriesForSelectedDate(updated);

    fetchMonthEntries();

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
        fetchMonthEntries();
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
        fetchMonthEntries();
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
    modalOpen,
    closeModal,
    handleDateClick,
    handleFormSubmit,
    handleDelete,
    handleMonthChange,
    handleTodayClick,
    refreshDashboardData,
    fetchMonthEntries,
    updateEntryField,
    saveEntryEdit,
    setEditingHours,
    setEditingDescriptions,
    editingHours,
    editingDescriptions,
  };
}
