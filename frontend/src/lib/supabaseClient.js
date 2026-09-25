import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy frontend/.env.example to frontend/.env and fill in your Supabase project details.'
  );
}

// The "anon" key is safe to use in the browser - it only allows what your
// Row Level Security policies permit. Never put the service_role key here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
