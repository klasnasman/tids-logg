import {
  getDay,
  getDaysInMonth,
  format,
  parse,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isValid,
  parseISO,
} from "date-fns";
import { sv } from "date-fns/locale";
import { getHolidays } from "swedish-holidays";

const swedishHolidays = getHolidays;

export const DAYS_OF_WEEK = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export const MONTHS = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

export function getMonthName(monthIndex: number): string {
  return MONTHS[monthIndex];
}

export function formatDateString(date: Date, endOfDay = false): string {
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
    return date.toISOString(); // full ISO format to retain time
  }
  date.setHours(0, 0, 0, 0);
  return format(date, "yyyy-MM-dd"); // keep startDate format
}

export function parseDate(dateString: string): Date {
  // Try 'yyyy-MM-dd'
  let parsed = parse(dateString, "yyyy-MM-dd", new Date());

  if (!isValid(parsed)) {
    // Fallback to ISO
    parsed = parseISO(dateString);
  }

  return parsed;
}

export function getDaysInMonthArray(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(date);

  return Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(year, month, i + 1);
  });
}

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month, getDaysInMonth(firstDay));

  // Get day of the week (0 = Monday in our calendar, but 0 = Sunday in JS, so we adjust)
  let firstDayOfWeek = getDay(firstDay);
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const daysToAdd = (7 - ((lastDay.getDate() + firstDayOfWeek) % 7)) % 7;

  const prevMonthDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = new Date(year, month, -i);
    prevMonthDays.unshift(day);
  }

  const currentMonthDays = getDaysInMonthArray(year, month);

  const nextMonthDays = [];
  for (let i = 1; i <= daysToAdd; i++) {
    const day = new Date(year, month + 1, i);
    nextMonthDays.push(day);
  }

  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  const date = addMonths(new Date(year, month, 1), 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  const date = subMonths(new Date(year, month, 1), 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function getNextYear(year: number, month: number): { year: number; month: number } {
  const date = addYears(new Date(year, month, 1), 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function getPrevYear(year: number, month: number): { year: number; month: number } {
  const date = subYears(new Date(year, month, 1), 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function isCurrentMonth(date: Date, currentYear: number, currentMonth: number): boolean {
  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
}

export function isHoliday(date: Date): { isHoliday: boolean; name?: string } {
  const holidays = swedishHolidays(date.getFullYear());
  const dateStr = formatDateString(date);

  const holiday = holidays.find((h) => formatDateString(new Date(h.date)) === dateStr);

  if (holiday) {
    return { isHoliday: true, name: holiday.name };
  }

  return { isHoliday: false };
}

export function getHolidayInfo(date: Date): { isHoliday: boolean; name: string | null } {
  const holidays = swedishHolidays(date.getFullYear());
  const dateStr = formatDateString(date);

  const holiday = holidays.find((h) => formatDateString(new Date(h.date)) === dateStr);

  return {
    isHoliday: Boolean(holiday),
    name: holiday?.name ?? null,
  };
}

export function formatSwedishDate(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: sv });
}

export function getVisibleCalendarDays(year: number, month: number, showWeekends: boolean): Date[] {
  const allDays = getCalendarDays(year, month);
  return allDays.filter((date) => showWeekends || (date.getDay() !== 0 && date.getDay() !== 6));
}

export function getWeekNumber(date: Date): number {
  const tmpDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const dayNum = tmpDate.getUTCDay() || 7;
  tmpDate.setUTCDate(tmpDate.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(tmpDate.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(((tmpDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

export function getCalendarWithWeeks(days: Date[], showWeekends: boolean): (Date | number)[] {
  const result: (Date | number)[] = [];
  const daysPerWeek = showWeekends ? 7 : 5;

  for (let i = 0; i < days.length; i += daysPerWeek) {
    const weekDays = days.slice(i, i + daysPerWeek);
    result.push(getWeekNumber(weekDays[0]), ...weekDays);
  }

  return result;
}

export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6;
}

export function getDayClass(date: Date, currentMonth: number): string {
  const { isHoliday: holiday } = isHoliday(date);
  if (holiday) return "text-danger";

  const isWeekendDay = isWeekend(date);
  const inCurrentMonth = date.getMonth() === currentMonth;

  if (isWeekendDay || !inCurrentMonth) return "text-muted";

  return "text-global-text";
}
