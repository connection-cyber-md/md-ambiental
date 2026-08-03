import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getServerEnv } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS entirely — only use for
 * privileged server-side operations (e.g. the custom access token hook's
 * companion admin tasks, cross-tenant system-admin actions). Never import
 * this from a client component or expose its output to the browser.
 */
export function createAdminClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada — necessária para o admin client."
    );
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
