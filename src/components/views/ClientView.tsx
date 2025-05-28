import Delete from "@assets/icons/delete";
import ClientModal from "@components/modals/ClientModal";
import { useClient } from "@hooks/useClient";
import { isClientModalOpen, openClientModal } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import React from "react";

type ClientListProps = {
  initialSession: Session | null;
  selectedMonth: Date;
};

const ClientList: React.FC<ClientListProps> = ({ initialSession, selectedMonth }) => {
  const {
    user,
    $clients,
    newClientName,
    setNewClientName,
    newClientDescription,
    setNewClientDescription,
    newClientColor,
    setNewClientColor,
    editingNames,
    handleCreateClient,
    handleDeleteClient,
    handleNameInputChange,
    handleSubmitNameUpdate,
    handleNameKeyDown,
    handleColorChange,
    handleColorPickerClose,
  } = useClient({ initialSession, selectedMonth });

  const isOpen = useStore(isClientModalOpen);

  return (
    <section className="clients / h-1/2 px-base pt-base border-t border-global-text overflow-y-auto">
      <div id="client-list" className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-xs">
          {$clients.map((client) => (
            <article key={client.id} className="flex items-center justify-between py-xs">
              <div className="repel" data-nowrap>
                <div className="flex items-center gap-base w-full">
                  <input
                    type="color"
                    value={client.color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      handleColorChange(client.id, newColor);
                    }}
                    onBlur={handleColorPickerClose}
                    className="w-2 cursor-default hover:opacity-60 transition-opacity"
                  />
                  <input
                    type="text"
                    value={editingNames[client.id] ?? client.name}
                    onChange={(e) => handleNameInputChange(client.id, e.target.value)}
                    onBlur={() => handleSubmitNameUpdate(client.id)}
                    onKeyDown={(e) => handleNameKeyDown(e, client.id)}
                    className="w-full border-b border-dashed px-xs truncate transition hover:bg-hover focus:bg-input-focus"
                  />
                </div>
              </div>
              <button
                className="hover:text-danger transition-colors pl-2"
                onClick={() => handleDeleteClient(client.id)}>
                <Delete />
              </button>
            </article>
          ))}
        </div>
        <div className="pt-sm pb-sm">
          {user?.id ? (
            <button
              onClick={openClientModal}
              aria-controls="new-client-form"
              className="button w-full"
              data-variant="white">
              Ny kund
            </button>
          ) : null}
        </div>
      </div>
      <ClientModal
        isOpen={isOpen}
        newClientName={newClientName}
        newClientColor={newClientColor}
        newClientDescription={newClientDescription}
        user={user}
        setNewClientName={setNewClientName}
        setNewClientColor={setNewClientColor}
        setNewClientDescription={setNewClientDescription}
        handleCreateClient={handleCreateClient}
      />
    </section>
  );
};

export default ClientList;
