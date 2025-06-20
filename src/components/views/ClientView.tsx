import Delete from "@assets/icons/delete";
import ClientModal from "@components/modals/ClientModal";
import ConfirmationModal from "@components/modals/ConfirmationModal";
import { useClient } from "@hooks/useClient";
import { isClientModalOpen, isConfirmModalOpen, openClientModal } from "@lib/stores/UIStore";
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
    handleNameInputChange,
    handleSubmitNameUpdate,
    handleNameKeyDown,
    handleColorChange,
    handleColorPickerClose,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    confirmDeleteClient,
    isConfirmOpen,
    clientToDelete,
  } = useClient({ initialSession, selectedMonth });

  const isOpen = useStore(isClientModalOpen);

  return (
    <section className="clients / grow px-base pt-base border-t border-global-text overflow-y-auto">
      <div id="client-list" className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-base">
          {$clients.map((client) => (
            <article key={client.id} className="flex items-center justify-between">
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
                    className="w-full border-b border-dashed truncate transition hover:bg-hover focus:bg-input-focus"
                  />
                </div>
                <button className="hover:text-danger transition-colors" onClick={() => openConfirmDeleteModal(client)}>
                  <Delete />
                </button>
              </div>
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
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmDeleteModal}
        onConfirm={confirmDeleteClient}
        title={`Radera kund '${clientToDelete?.name ?? ""}'`}
        message="Alla tidsregistreringar för denna kund kommer att tas bort. Detta kan inte ångras."
      />
    </section>
  );
};

export default ClientList;
