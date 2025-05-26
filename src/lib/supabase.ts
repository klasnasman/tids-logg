import { createClient } from '@supabase/supabase-js';

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  hours?: number;
};

export type TimeEntry = {
  id: string;
  user_id: string;
  client_id: string;
  date: string;
  hours: number;
  description: string | null;
  created_at: string;
};

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});
