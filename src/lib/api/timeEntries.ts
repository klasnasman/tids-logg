import { supabase, type TimeEntry } from '../supabase';

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

export async function getTimeEntriesForMonth(userId: string, year: number, month: number): Promise<TimeEntry[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // last day of the month
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", from)
    .lte("date", to);

  if (error) {
    console.error("Error fetching time entries for month", error);
    return [];
  }

  return data as TimeEntry[];
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

export async function getTimeEntriesByClient(
  userId: string,
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<TimeEntry[]> {
  let query = supabase
    .from('time_entries')
    .select('*, clients(*)')
    .eq('user_id', userId)
    .eq('client_id', clientId);
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching time entries by client:', error);
    throw error;
  }
  
  return data || [];
}

// Get dates with time entries for a month
export async function getDatesWithTimeEntries(
  userId: string, 
  year: number, 
  month: number
): Promise<string[]> {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
  
  const { data, error } = await supabase
    .from('time_entries')
    .select('date')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');
  
  if (error) {
    console.error('Error fetching dates with time entries:', error);
    throw error;
  }
  
  return [...new Set(data?.map(entry => entry.date))];
}