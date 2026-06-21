import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client using the service role key.
 * ⚠️ WARNING: This client bypasses Row Level Security (RLS) policies.
 * ONLY use this client in secure server environments (never expose to the browser).
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please check your server setup."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
