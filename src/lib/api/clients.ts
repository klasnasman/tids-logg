import { supabase, type Client } from "@lib/supabase";

export async function createClient(client: Omit<Client, "id" | "created_at">): Promise<Client> {
  
  const { error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("createClient:", sessionError);
  }

  const { data, error } = await supabase.from("clients").insert(client).select().single();

  if (error) {
    console.error("createClient:", error);
    throw error;
  }

  return data;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}