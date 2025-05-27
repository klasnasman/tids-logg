import { atom } from "nanostores";
import type { Client, TimeEntry } from "../supabase";
import { getTimeEntriesForDateRange } from "@lib/api/timeEntries";
import { clientStore } from "./clientStore";
import { formatDateString } from "@lib/utils/calendarUtils";

type ClientWithHours = Client & { hours: number; percentage?: number };

export type TimeStatsState = {
  today: number;
  week: number;
  month: number;
  year: number;
  clientDistribution: ClientWithHours[];
};

export const timeStatsStore = atom<TimeStatsState>({
  today: 0,
  week: 0,
  month: 0,
  year: 0,
  clientDistribution: [],
});

export const loading = atom<boolean>(true);
export const authError = atom<string | null>(null);
export const monthEntries = atom<TimeEntry[]>([]);
export const allEntries = atom<TimeEntry[]>([]);

function getDateRanges(selectedDate: Date) {
  // Current real date/time for today/week calculation:
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Selected month date for month/year ranges:
  const monthDate = new Date(selectedDate);
  monthDate.setHours(23, 59, 59, 999);

  // Today range (based on actual today)
  const startOfToday = new Date(now);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Week range (based on actual today)
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? 6 : currentDay - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Month range (based on selected month)
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  // Clamp startOfWeek to not be before startOfMonth
  const clampedStartOfWeek = startOfWeek < startOfMonth ? startOfMonth : startOfWeek;
  // Clamp endOfWeek to not be after endOfMonth
  const clampedEndOfWeek = endOfWeek > endOfMonth ? endOfMonth : endOfWeek;

  // Year range (based on selected month)
  const startOfYear = new Date(monthDate.getFullYear(), 0, 1);
  const endOfYear = new Date(monthDate.getFullYear(), 11, 31);

  return {
    todayStart: formatDateString(startOfToday),
    todayEnd: formatDateString(endOfToday),
    startOfWeek: formatDateString(clampedStartOfWeek),
    endOfWeek: formatDateString(clampedEndOfWeek),
    startOfMonth: formatDateString(startOfMonth),
    endOfMonth: formatDateString(endOfMonth),
    startOfYear: formatDateString(startOfYear),
    endOfYear: formatDateString(endOfYear),
  };
}

async function fetchTimeEntries(userId: string, dateRanges: Record<string, string>) {
  const todayEntries = await getTimeEntriesForDateRange(userId, dateRanges.todayStart, dateRanges.todayEnd);
  const weekEntries = await getTimeEntriesForDateRange(userId, dateRanges.startOfWeek, dateRanges.endOfWeek);
  const monthEntries = await getTimeEntriesForDateRange(userId, dateRanges.startOfMonth, dateRanges.endOfMonth);
  const yearEntries = await getTimeEntriesForDateRange(userId, dateRanges.startOfYear, dateRanges.endOfYear);

  return { todayEntries, weekEntries, monthEntries, yearEntries };
}

function calculateTotalHours(entries: {
  todayEntries: TimeEntry[];
  weekEntries: TimeEntry[];
  monthEntries: TimeEntry[];
  yearEntries: TimeEntry[];
}) {
  const sumHours = (entries: TimeEntry[]) => entries.reduce((total, e) => total + e.hours, 0);

  return {
    today: sumHours(entries.todayEntries),
    week: sumHours(entries.weekEntries),
    month: sumHours(entries.monthEntries),
    year: sumHours(entries.yearEntries),
  };
}

async function loadClientDistribution(userId: string, entries: TimeEntry[]) {
  const clients = clientStore.get();

  const clientMap = clients.reduce(
    (map, client) => {
      map[client.id] = { ...client, hours: 0 };
      return map;
    },
    {} as Record<string, ClientWithHours>
  );

  const totalHours = entries.reduce((total, entry) => {
    const client = clientMap[entry.client_id];
    if (client) client.hours += entry.hours;
    return total + entry.hours;
  }, 0);

  const sortedClients = Object.values(clientMap)
    .filter((p) => p.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  return sortedClients.map((client) => ({
    ...client,
    percentage: totalHours > 0 ? (client.hours / totalHours) * 100 : 0,
  }));
}

export async function loadTimeStats(userId: string, selectedMonth: Date) {
  if (!userId) {
    authError.set("Not logged in.");
    loading.set(false);
    return;
  }

  authError.set(null);
  loading.set(true);

  try {
    const dateRanges = getDateRanges(selectedMonth);
    const {
      todayEntries,
      weekEntries,
      monthEntries: mEntries,
      yearEntries,
    } = await fetchTimeEntries(userId, dateRanges);

    monthEntries.set(mEntries);
    allEntries.set(yearEntries);

    const hoursByPeriod = calculateTotalHours({ todayEntries, weekEntries, monthEntries: mEntries, yearEntries });

    const clientDistribution = await loadClientDistribution(userId, mEntries);

    timeStatsStore.set({
      ...hoursByPeriod,
      clientDistribution,
    });
  } catch (error) {
    console.error("Error loading time statistics:", error);
  } finally {
    loading.set(false);
  }
}
