import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { getClientEnv } from "@/lib/env";

/** Browser-side Supabase client — use in client components. */
export function createClient() {
  const env = getClientEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
