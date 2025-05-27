import { refreshDashboardData } from "@lib/actions/refreshDashboardData";
import { createClient, deleteClient, updateClient } from "@lib/api/clients";
import { authStore } from "@lib/stores/auth/authStore";
import { clientStore, loadClients } from "@lib/stores/clientStore";
import { closeClientModal } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface UseClientProps {
  initialSession: Session | null;
  selectedMonth: Date;
}

export function useClient({ initialSession, selectedMonth }: UseClientProps) {

  const $clients = useStore(clientStore);
  const $auth = useStore(authStore);
  const user = initialSession?.user ?? $auth.user;  

  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState("");
  const [newClientDescription, setNewClientDescription] = useState("");
  const [newClientColor, setNewClientColor] = useState("#0055FF");
  const [authError, setAuthError] = useState<string | null>(null);

  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setAuthError("Not logged in.");
      return;
    }

    setAuthError(null);
    setLoading(true);
    loadClients(user.id).finally(() => setLoading(false));
  }, [user]);

  const reloadClients = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await refreshDashboardData(user.id, selectedMonth);
      setAuthError(null);
    } catch {
      setAuthError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!user?.id) {
      setAuthError("User not logged in! Cannot create client.");
      return;
    }

    if (!newClientName.trim()) {
      setAuthError("Client name cannot be empty.");
      return;
    }

    const newClient = {
      user_id: user.id,
      name: newClientName.trim(),
      description: newClientDescription?.trim() || null,
      color: newClientColor,
    };

    try {
      await createClient(newClient);
      await reloadClients();
      closeClientModal();
      setNewClientName("");
      setNewClientDescription("");
      setNewClientColor("#0055FF");
      setAuthError(null);
    } catch (error: any) {
      if (error.message?.toLowerCase().includes("policy") || error.code === "42501") {
        setAuthError("Permission denied: You don't have permission to create clients.");
      } else {
        setAuthError("Failed to create client. Please try again.");
      }
      console.error("Create client error:", error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      await reloadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
      setAuthError("Could not delete the client.");
    }
  };

  const handleUpdateClientName = async (id: string, newName: string) => {
    try {
      await updateClient(id, { name: newName });
      await reloadClients();
    } catch (error) {
      console.error("Failed to update client name:", error);
      setAuthError("Could not update client name.");
    }
  };

  const handleUpdateClientColor = async (id: string, newColor: string) => {
    try {
      await updateClient(id, { color: newColor });
      await reloadClients();
    } catch (error) {
      console.error("Failed to update client color:", error);
      setAuthError("Could not update client color.");
    }
  };

  const handleNameInputChange = (id: string, value: string) => {
    setEditingNames((prev) => ({ ...prev, [id]: value }));
  };

  const clearEditingName = (id: string) => {
    setEditingNames((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmitNameUpdate = async (id: string) => {
    const newName = editingNames[id]?.trim();
    if (!newName) return;
    await handleUpdateClientName(id, newName);
    clearEditingName(id);
  };

  const handleNameKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSubmitNameUpdate(id);
    } else if (e.key === "Escape") {
      clearEditingName(id);
    }
  };

  const handleColorChange = async (id: string, newColor: string) => {
    await handleUpdateClientColor(id, newColor);
  };

  const handleColorPickerClose = () => {
    setEditingColorId(null);
  };

  return {
    user,
    $clients,
    loading,
    authError,
    newClientName,
    setNewClientName,
    newClientDescription,
    setNewClientDescription,
    newClientColor,
    setNewClientColor,
    editingColorId,
    editingNames,
    handleCreateClient,
    handleDeleteClient,
    handleNameInputChange,
    handleSubmitNameUpdate,
    handleNameKeyDown,
    handleColorChange,
    handleColorPickerClose,
  };
}
