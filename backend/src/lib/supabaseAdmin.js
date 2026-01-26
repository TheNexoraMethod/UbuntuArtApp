import { createClient } from "@supabase/supabase-js";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Server-side Supabase client (service role).
 * IMPORTANT: Never expose this key to the mobile app.
 */
export const supabaseAdmin = createClient(
  required("SUPABASE_URL"),
  required("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: { persistSession: false },
  }
);
