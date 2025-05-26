import { atom } from "nanostores";
import { supabase, type Client } from "@lib/supabase";

export const clientStore = atom<Client[]>([]);

export async function loadClients(userId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return;
  }

  clientStore.set(data || []);
}

export function addClientInStore(newClient: Client) {
  clientStore.set([...clientStore.get(), newClient]);
}

export function updateClientInStore(updatedClient: Client) {
  clientStore.set(clientStore.get().map((p) => (p.id === updatedClient.id ? updatedClient : p)));
}

export function removeClientInStore(clientId: string) {
  clientStore.set(clientStore.get().filter((p) => p.id !== clientId));
}