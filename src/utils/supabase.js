import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase frontend client: REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_PUBLISHABLE_KEY is not set. " +
      "Direct Supabase queries from the browser will not work."
  );
}

// Publishable (anon) client — safe for browser use.
// For writes that require admin rights, always go through the Express backend.
export const supabase = createClient(supabaseUrl, supabaseKey);
