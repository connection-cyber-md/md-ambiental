import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";
import { getClientEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session cookie on every matched request and
 * returns both the response (with refreshed cookies) and the authenticated
 * user. Always calls `getUser()` (not `getSession()`) so the user is
 * revalidated against the Auth server rather than trusting a locally
 * decoded, potentially stale JWT.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getClientEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // getUser() already revalidated the session against the Auth server above,
  // so it's safe to also read the access token here for JWT claim decoding.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { response, user, accessToken: session?.access_token ?? null };
}
