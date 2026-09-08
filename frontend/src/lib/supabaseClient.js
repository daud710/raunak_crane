import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Don't crash the whole app in dev before .env is set up — just warn loudly.
  console.warn(
    "Supabase env vars are missing. Copy frontend/.env.example to frontend/.env and fill it in."
  );
}

// Uses only the public anon key. Row Level Security (see supabase/schema.sql) is what
// actually keeps writes locked to logged-in admins — this key is safe to ship to the browser.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
