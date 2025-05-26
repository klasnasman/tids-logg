  import { getDay, getDaysInMonth, format, parse, addMonths, subMonths, addYears, subYears, isValid, parseISO } from 'date-fns';
  import { sv } from 'date-fns/locale';
  import { getHolidays } from "swedish-holidays";

  const swedishHolidays = getHolidays;

  export const DAYS_OF_WEEK = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  export const MONTHS = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];

  export function getMonthName(monthIndex: number): string {
    return MONTHS[monthIndex];
  }

  export function formatDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
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

    // Next month days
    const nextMonthDays = [];
    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(year, month + 1, i);
      nextMonthDays.push(day);
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }

  export function getNextMonth(year: number, month: number): { year: number, month: number } {
    const date = addMonths(new Date(year, month, 1), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  export function getPrevMonth(year: number, month: number): { year: number, month: number } {
    const date = subMonths(new Date(year, month, 1), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  export function getNextYear(year: number, month: number): { year: number, month: number } {
    const date = addYears(new Date(year, month, 1), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  export function getPrevYear(year: number, month: number): { year: number, month: number } {
    const date = subYears(new Date(year, month, 1), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }

  export function isToday(date: Date): boolean {
    const today = new Date();
    return date.toLocaleDateString() === today.toLocaleDateString();
  }

  export function isCurrentMonth(date: Date, currentYear: number, currentMonth: number): boolean {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }

  export function isWeekend(date: Date): boolean {
    const day = getDay(date);
    return day === 0 || day === 6; // Sunday or Saturday
  }

  export function isHoliday(date: Date): { isHoliday: boolean, name?: string } {
    const holidays = swedishHolidays(date.getFullYear()); // ⬅️ CALL the default import
    const dateStr = formatDateString(date);

    const holiday = holidays.find(h => formatDateString(new Date(h.date)) === dateStr);

    if (holiday) {
      return { isHoliday: true, name: holiday.name };
    }

    return { isHoliday: false };
  }

  export function formatSwedishDate(date: Date): string {
    return format(date, 'd MMMM yyyy', { locale: sv });
  }