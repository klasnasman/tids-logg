import { AnimateModal } from "@components/misc/AnimateModal";
import { closeClientModal } from "@lib/stores/UIStore";
import type { User } from "@supabase/supabase-js";
import React from "react";

interface ClientModalProps {
  isOpen: boolean;
  newClientName: string;
  newClientColor: string;
  newClientDescription: string;
  user?: User | null;
  setNewClientName: (name: string) => void;
  setNewClientColor: (color: string) => void;
  setNewClientDescription: (description: string) => void;
  handleCreateClient: () => void;
}

export default function ClientModal({
  isOpen,
  newClientName,
  newClientColor,
  newClientDescription,
  user,
  setNewClientName,
  setNewClientColor,
  setNewClientDescription,
  handleCreateClient,
}: ClientModalProps) {
  return (
    <AnimateModal isOpen={isOpen} onClose={closeClientModal} modalClassName="flow">
      <form
        id="new-project-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateClient();
        }}>
        <div className="flow">
          <div className="flex justify-start items-center w-full">
            <p>Skapa ny kund</p>
          </div>
          <div className="flow-sm">
            <div className="flex gap-base">
              <input
                id="client-name"
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                required
                className="w-full px-3 py-base border cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kundnamn"
                autoFocus
              />
              <input
                id="client-color"
                type="color"
                value={newClientColor}
                onChange={(e) => setNewClientColor(e.target.value)}
                className="w-input-height cursor-default"
              />
            </div>
            <textarea
              id="client-description"
              value={newClientDescription}
              onChange={(e) => setNewClientDescription(e.target.value)}
              className="w-full px-3 py-base border cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Beskriv kunden"
              rows={3}
            />
            <div className="repel mt-lg">
              <button type="button" onClick={closeClientModal} className="button" data-variant="white">
                Stäng
              </button>
              <button className="button" data-variant="white" type="submit" disabled={!user?.id}>
                Skapa
              </button>
            </div>
          </div>
        </div>
      </form>
    </AnimateModal>
  );
}
