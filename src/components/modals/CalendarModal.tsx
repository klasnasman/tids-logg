import Delete from "@assets/icons/delete";
import { ModalWrapper } from "@components/modals/ModalWrapper";
import { closeCalendarModal } from "@lib/stores/UIStore";
import React from "react";

interface CalendarModalProps {
  isOpen: boolean;
  day: string;
  month: string;
  year: string;
  holidayName?: string | null;
  entriesForSelectedDate: any[];
  $clients: any[];
  editingHours: Record<string, string>;
  editingDescriptions: Record<string, string>;
  editingEntryId: string | null;
  form: {
    client: string;
    hours: string;
    description: string;
  };
  setEditingEntryId: (id: string | null) => void;
  updateEntryField: (entryId: string, field: "hours" | "description", value: string) => void;
  handleDelete: (id: string) => void;
  setForm: (form: any) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  setEditingHours: (hours: Record<string, string>) => void;
  setEditingDescriptions: (descriptions: Record<string, string>) => void;
  saveEntryEdit: (id: string, field: "hours" | "description") => Promise<void>;
}

export default function CalendarModal({
  isOpen,
  day,
  month,
  year,
  holidayName,
  entriesForSelectedDate,
  $clients,
  editingHours,
  editingDescriptions,
  editingEntryId,
  form,
  setEditingEntryId,
  updateEntryField,
  handleDelete,
  setForm,
  handleFormSubmit,
  setEditingHours,
  setEditingDescriptions,
  saveEntryEdit,
}: CalendarModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={closeCalendarModal}>
      <div className="flex justify-start items-center w-full">
        <span className="flex gap-[1ch]">
          <p>{day}</p>
          <p className="uppercase">{month}</p>
          <p>{year}</p>
        </span>
        {holidayName && (
          <div className="h-input absolute -top-[26px] -right-[1px] transform p-xs bg-info-bg text-info-text border border-info-border z-modal">
            <p className="leading-input">{holidayName}</p>
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
                <div key={entry.id} className="group repel cursor-pointer" data-nowrap>
                  <div className="hover:bg-hover transition-all w-full">
                    <span className="truncate w-full flex items-center gap-base">
                      <p className="cursor-default">{client?.name ?? "Projekt"}</p>
                      <input
                        type="number"
                        className="max-w-[4ch] border-b border-dashed transition-all focus:bg-input-focus"
                        value={editingHours[entry.id] ?? entry.hours.toString()}
                        min="0.5"
                        step="0.5"
                        onFocus={() => setEditingEntryId(entry.id)}
                        onChange={(e) => updateEntryField(entry.id, "hours", e.target.value)}
                      />
                      <input
                        type="text"
                        className="text-muted border-b w-full min-w-0 border-dashed truncate transition-all hover:bg-hover focus:bg-input-focus"
                        value={editingDescriptions[entry.id] ?? entry.description ?? ""}
                        placeholder=""
                        onFocus={() => setEditingEntryId(entry.id)}
                        onChange={(e) => updateEntryField(entry.id, "description", e.target.value)}
                      />
                    </span>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="hover:text-danger transition-colors">
                    <Delete />
                  </button>
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
    </ModalWrapper>
  );
}
