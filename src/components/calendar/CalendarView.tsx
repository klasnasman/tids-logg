import Delete from "@assets/icons/delete";
import { AnimateModal } from "@components/misc/AnimateModal";
import { useCalendar } from "@hooks/useCalendar";
import { closeCalendarModal, isCalendarModalOpen, showWeekends } from "@lib/stores/UIStore";
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
  const visibleDays = $showWeekends ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);
  const [editingEntryId, setEditingEntryId] = React.useState<string | null>(null);
  const formattedDate = formatSwedishDate(selectedDate);
  const [day, month, year] = formattedDate.split(" ");
  const currentWeekNumber = getWeekNumber(new Date());

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
        className={`grid h-full px-base p-base gap-xs grid-rows-[min-content_repeat(5,auto)] ${
          $showWeekends ? "grid-cols-[auto_repeat(7,minmax(0,1fr))]" : "grid-cols-[auto_repeat(5,minmax(0,1fr))]"
        }`}>
        <div aria-hidden="true"></div>
        {visibleDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}

        {calendarWithWeeks.map((item, index) => {
          if (typeof item === "number") {
            const isCurrentWeek = item === currentWeekNumber;
            return (
              <div
                key={"week-" + index}
                className={`grid justify-center text-[10px] leading-none ${isCurrentWeek ? "text-blue-500" : "text-muted"}`}
                style={{ writingMode: "sideways-lr" }}>
                {item}
              </div>
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
              className="calendar-card / border p-xs cursor-pointer transition-all hover:bg-hover hover:shadow-sm">
              <p className={`w-full text-left pb-xs ${buttonTextClass}`} title={holidayTitle ?? ""}>
                {date.getDate()}
              </p>
              {entriesForDate.length > 0 && (
                <ul className="flow-xs">
                  {entriesForDate.map((entry) => {
                    const client = $clients.find((p) => p.id === entry.client_id);
                    return (
                      <li key={entry.id} className="truncate flex items-baseline gap-1">
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

      <AnimateModal isOpen={isOpen} onClose={closeCalendarModal}>
        <div className="flex justify-start items-center w-full">
          <span className="flex gap-[1ch]">
            <p>{day}</p>
            <p className="uppercase">{month}</p>
            <p>{year}</p>
          </span>
          {holidayName && (
            <div className="h-[30px] absolute -top-[31px] -right-[1px] transform  p-xs bg-amber-50 text-amber-700 border border-amber-200 z-modal">
              {holidayName}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flow-xs">
          {entriesForSelectedDate.length > 0 ? (
            entriesForSelectedDate
              .slice()
              .sort((a, b) => {
                const clientA = $clients.find((p) => p.id === a.client_id)?.name ?? "";
                const clientB = $clients.find((p) => p.id === b.client_id)?.name ?? "";
                return clientA.localeCompare(clientB);
              })
              .map((entry) => {
                const client = $clients.find((p) => p.id === entry.client_id);
                return (
                  <div key={entry.id} className="group flex flex-col hover:bg-hover transition-all cursor-pointer">
                    <div className="flex items-end justify-between gap-base">
                      <span className="truncate flex items-center gap-base">
                        <p className="cursor-default">{client?.name ?? "Projekt"}</p>
                        <input
                          type="number"
                          className="border-b border-dashed px-xs truncate transition-all hover:bg-hover focus:bg-input-focus"
                          value={editingHours[entry.id] ?? entry.hours.toString()}
                          min="0.5"
                          step="0.5"
                          onFocus={() => setEditingEntryId(entry.id)}
                          onChange={(e) => updateEntryField(entry.id, "hours", e.target.value)}
                        />
                        <input
                          type="text"
                          className="text-muted border-b border-dashed px-xs truncate transition-all hover:bg-hover focus:bg-input-focus"
                          value={editingDescriptions[entry.id] ?? entry.description ?? ""}
                          placeholder="Beskrivning"
                          onFocus={() => setEditingEntryId(entry.id)}
                          onChange={(e) => updateEntryField(entry.id, "description", e.target.value)}
                        />
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="pb-0.5 hover:text-danger transition-colors">
                        <Delete />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-muted">Inga timmar registrerade.</div>
          )}
        </div>
        <form onSubmit={handleFormSubmit} className="flow-sm">
          <select
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            required
            className="w-full px-xs border focus:outline-none">
            <option value="">Välj projekt</option>
            {$clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            placeholder="Timmar"
            min="0.5"
            step="0.5"
            required
            className="w-full px-base py-base border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Vad arbetade du med?"
            rows={3}
            className="w-full px-base py-base border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="repel mt-lg">
            <button
              type="button"
              className="button"
              data-variant="white"
              onClick={async () => {
                setEditingHours({});
                setEditingDescriptions({});
                setEditingEntryId(null);
                closeCalendarModal();
              }}>
              Stäng
            </button>

            {editingEntryId ? (
              <button
                type="button"
                className="button"
                data-variant="white"
                onClick={async () => {
                  await saveEntryEdit(editingEntryId, "hours");
                  await saveEntryEdit(editingEntryId, "description");
                  setEditingEntryId(null);
                  closeCalendarModal();
                }}>
                Spara
              </button>
            ) : (
              <button type="submit" className="button" data-variant="white">
                Spara
              </button>
            )}
          </div>
        </form>
      </AnimateModal>
    </section>
  );
}
