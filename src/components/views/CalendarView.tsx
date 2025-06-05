import CalendarModal from "@components/modals/CalendarModal";
import { useCalendar } from "@hooks/useCalendar";
import { isCalendarModalOpen, showWeekends } from "@lib/stores/UIStore";
import {
  DAYS_OF_WEEK,
  formatDateString,
  formatSwedishDate,
  getCalendarWithWeeks,
  getDayClass,
  getHolidayInfo,
  getMonthName,
  getNextMonth,
  getNextYear,
  getPrevMonth,
  getPrevYear,
  getVisibleCalendarDays,
  getWeekNumber,
  isCurrentMonth,
} from "@lib/utils/calendarUtils";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import React from "react";

interface CalendarProps {
  initialSession?: Session | null;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({ initialSession, selectedMonth, onMonthChange }: CalendarProps) {
  const {
    $clients,
    $monthEntries,
    entriesForSelectedDate,
    selectedDate,
    form,
    groupAndSumEntriesByClient,
    setForm,
    holidayName,
    currentYear,
    currentMonth,
    handleDateClick,
    handleTodayClick,
    handleFormSubmit,
    handleDelete,
    handleMonthChange,
    currentTime,
    currentDate,
    updateEntryField,
    saveEntryEdit,
    setEditingHours,
    setEditingDescriptions,
    editingHours,
    editingDescriptions,
  } = useCalendar({ initialSession, selectedMonth, onMonthChange });

  const $showWeekends = useStore(showWeekends);
  const isOpen = useStore(isCalendarModalOpen);

  const filteredCalendarDays = getVisibleCalendarDays(currentYear, currentMonth, $showWeekends);
  const calendarWithWeeks = getCalendarWithWeeks(filteredCalendarDays, $showWeekends);
  const currentWeekNumber = getWeekNumber(new Date());
  const visibleDays = $showWeekends ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);
  const [editingEntryId, setEditingEntryId] = React.useState<string | null>(null);
  const formattedDate = formatSwedishDate(selectedDate);
  const [day, month, year] = formattedDate.split(" ");

  return (
    <section className="calendar-view / h-full flex flex-col overflow-y-auto">
      <nav>
        <div className="flex justify-center items-center mb-md base:px-base px-0">
          <div className="flex justify-between base:justify-center items-center border-b base:border-x border-global-text h-full reel w-full base:w-fit">
            <div className="border-r px-sm">
              <p className="uppercase">
                {getMonthName(currentMonth)} {currentYear}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleMonthChange(getPrevYear)}
                className="p-base hover:bg-hover transition-colors">
                År-
              </button>
              <button
                onClick={() => handleMonthChange(getPrevMonth)}
                className="p-base hover:bg-hover transition-colors">
                Månad-
              </button>
              <button onClick={() => handleTodayClick()} className="p-base hover:bg-hover transition-colors">
                Idag
              </button>
              <button
                onClick={() => handleMonthChange(getNextMonth)}
                className="p-base hover:bg-hover transition-colors">
                Månad+
              </button>
              <button
                onClick={() => handleMonthChange(getNextYear)}
                className="p-base hover:bg-hover transition-colors">
                År+
              </button>
            </div>
            <div className="flex border-l px-sm text-right gap-base">
              <p className="uppercase text-muted">{currentDate}</p>
              <p className="uppercase text-muted">{currentTime}</p>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`grid h-full px-base p-base gap-xs grid-rows-[min-content_repeat(5,auto)] [&>div:nth-child(7)]:text-muted [&>div:nth-child(8)]:text-muted ${
          $showWeekends ? "grid-cols-[auto_repeat(7,minmax(0,1fr))] " : "grid-cols-[auto_repeat(5,minmax(0,1fr))]"
        }`}>
        <p aria-hidden="true"></p>
        {visibleDays.map((day, i) => {
          const todayIndex = (new Date().getDay() + 6) % 7;

          return (
            <div key={day} className={`text-center ${i === todayIndex ? "text-blue-500" : ""}`}>
              {day}
            </div>
          );
        })}

        {calendarWithWeeks.map((item, index) => {
          if (typeof item === "number") {
            const isCurrentWeek = item === currentWeekNumber;

            return (
              <p
                key={"week-" + index}
                className={`grid justify-center text-xxs leading-none ${isCurrentWeek ? "text-blue-500" : "text-muted"}`}
                style={{ writingMode: "sideways-lr" }}>
                {item}
              </p>
            );
          }

          const date = item;
          const dateStr = formatDateString(date);
          const entriesForDate = groupAndSumEntriesByClient($monthEntries.filter((entry) => entry.date === dateStr));
          const buttonTextClass = getDayClass(date, currentMonth);
          const { name: holidayTitle } = getHolidayInfo(date);

          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`calendar-card / border p-xs cursor-pointer transition-all hover:bg-hover hover:shadow-sm ${
                isCurrentMonth(date, currentYear, currentMonth) ? "" : "opacity-30"
              }`}>
              <p
                className={`w-full text-left pb-xs text-xxs leading-none ${buttonTextClass}`}
                title={holidayTitle ?? ""}>
                {date.getDate()}
              </p>
              {entriesForDate.length > 0 && (
                <ul className="flow-xs">
                  {entriesForDate.map((entry) => {
                    const client = $clients.find((p) => p.id === entry.client_id);
                    return (
                      <li key={entry.id} className="truncate flex items-baseline gap-xs">
                        {client?.color && (
                          <span className="w-1 h-3 inline-block shrink-0" style={{ backgroundColor: client.color }} />
                        )}
                        {client?.name && entry.hours ? (
                          <span className="repel" data-nowrap>
                            <p className="truncate max-w-[12ch]">{client.name}</p>
                            <p>{entry.hours}h</p>
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <CalendarModal
        isOpen={isOpen}
        day={day}
        month={month}
        year={year}
        holidayName={holidayName}
        entriesForSelectedDate={entriesForSelectedDate}
        $clients={$clients}
        editingHours={editingHours}
        editingDescriptions={editingDescriptions}
        editingEntryId={editingEntryId}
        form={form}
        setEditingEntryId={setEditingEntryId}
        updateEntryField={updateEntryField}
        handleDelete={handleDelete}
        setForm={setForm}
        handleFormSubmit={handleFormSubmit}
        setEditingHours={setEditingHours}
        setEditingDescriptions={setEditingDescriptions}
        saveEntryEdit={saveEntryEdit}
      />
    </section>
  );
}
