import { supabase, type TimeEntry } from "@lib/supabase";

export async function getTimeEntriesForDate(userId: string, date: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*, clients(*)')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
  
  return data || [];
}

export async function getTimeEntriesForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*, clients(*)')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
  
  return data || [];
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
  
  return data;
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
  
  return data;
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
}
