import React from "react";
import Delete from "@assets/icons/delete";
import { useCalendar } from "@hooks/useCalendar";
import {
  DAYS_OF_WEEK,
  formatSwedishDate,
  getCalendarDays,
  getMonthName,
  isToday,
  getNextMonth,
  getPrevMonth,
  getNextYear,
  getPrevYear,
  isHoliday,
  formatDateString,
} from "@lib/utils/calendar";
import type { Session } from "@supabase/supabase-js";
import { AnimateModal } from "@components/misc/AnimateModal";
import { showWeekends } from "@lib/stores/calendarUIStore";
import { useStore } from "@nanostores/react";

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
    modalOpen,
    closeModal,
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
  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const filteredCalendarDays = calendarDays.filter(
    (date) => $showWeekends || (date.getDay() !== 0 && date.getDay() !== 6)
  );
  const visibleDays = $showWeekends ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);
  const [editingEntryId, setEditingEntryId] = React.useState<string | null>(null);
  const formattedDate = formatSwedishDate(selectedDate);
  const [day, month, year] = formattedDate.split(" ");

  return (
    <section className="calendar-view / h-full flex flex-col overflow-y-auto">
      <nav>
        <div className="flex justify-center items-center mb-8 base:px-base px-0">
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
        className={`grid px-base ${
          $showWeekends
            ? "grid-cols-7 gap-base [&>div:nth-child(6)]:text-muted [&>div:nth-child(7)]:text-muted"
            : "grid-cols-5 gap-base"
        }`}>
        {visibleDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
      <div className={`grid h-full p-base gap-base ${$showWeekends ? "grid-cols-7" : "grid-cols-5"}`}>
        {filteredCalendarDays.map((date) => {
          const dateStr = formatDateString(date);
          const isSaturdayDate = date.getDay() === 6;
          const isSundayDate = date.getDay() === 0;
          const isTodayDate = isToday(date);
          const { isHoliday: isHolidayDate, name: holidayDisplayName } = isHoliday(date);
          const entriesForDate = groupAndSumEntriesByClient($monthEntries.filter((entry) => entry.date === dateStr));

          let buttonTextClass = "text-global-text";
          if (isTodayDate) {
            buttonTextClass = "text-blue-500";
          } else if (isHolidayDate) {
            buttonTextClass = "text-danger";
          } else if (isSaturdayDate || isSundayDate) {
            buttonTextClass = "text-muted";
          }

          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className="calendar-card / border p-xs cursor-pointer transition-all hover:bg-hover hover:shadow-sm">
              <p className={`w-full text-left ${buttonTextClass}`} title={holidayDisplayName ?? ""}>
                {date.getDate()}
              </p>
              {entriesForDate.length > 0 && (
                <ul>
                  {entriesForDate.map((entry) => {
                    const client = $clients.find((p) => p.id === entry.client_id);
                    return (
                      <li key={entry.id} className="truncate flex items-baseline gap-1">
                        {client?.color && (
                          <span className="w-1 h-3 inline-block shrink-0" style={{ backgroundColor: client.color }} />
                        )}
                        {client?.name && entry.hours ? (
                          <span className="flex w-full justify-between mt-1">
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

      <AnimateModal isOpen={modalOpen} onClose={closeModal}>
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

        <div className="overflow-y-auto">
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
                    <div className="flex items-end justify-between my-xs gap-base">
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
                closeModal();
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
                  closeModal();
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
