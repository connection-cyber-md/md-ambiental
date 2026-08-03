import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decodeClaims, getRoleFromClaims } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/rbac";

/** Handles the PKCE / magic-link code exchange for email confirmation and passwordless sign-in. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const role = getRoleFromClaims(decodeClaims(data.session.access_token));
  return NextResponse.redirect(`${origin}${role ? ROLE_HOME[role] : "/"}`);
}
