import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

let _supabaseAdmin = null;

const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (isSupabaseConfigured()) {
  _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.info("Supabase admin client initialised.");
} else {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  console.warn(
    `Supabase not configured – missing env vars: ${missing.join(", ")}. ` +
      "Storage and email-outbox features will return HTTP 503."
  );
}

export const supabaseAdmin = _supabaseAdmin;
export { isSupabaseConfigured };
