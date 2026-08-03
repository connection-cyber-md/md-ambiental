import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { getClientEnv } from "@/lib/env";

/**
 * Server-side Supabase client for Server Components, Server Actions and
 * Route Handlers. Reads/writes the auth cookie pair via `next/headers`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = getClientEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no write access to cookies
            // (e.g. rendering a page). Safe to ignore — middleware refreshes
            // the session on every request, so cookies stay in sync there.
          }
        },
      },
    }
  );
}
