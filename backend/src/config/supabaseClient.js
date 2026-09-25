import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[supabaseClient] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
    'Copy backend/.env.example to backend/.env and fill in your Supabase project details.'
  );
}

// IMPORTANT: this client uses the SERVICE ROLE key, which bypasses Row Level Security.
// It must only ever be used on the backend (this file), never sent to the frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
