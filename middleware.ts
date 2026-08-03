import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { decodeClaims, getRoleFromClaims } from "@/lib/auth/session";
import { matchProtectedPrefix, isRoleAllowed, ROLE_HOME } from "@/lib/auth/rbac";

export async function middleware(request: NextRequest) {
  const protectedPrefix = matchProtectedPrefix(request.nextUrl.pathname);
  if (!protectedPrefix) {
    return NextResponse.next({ request });
  }

  let session: Awaited<ReturnType<typeof updateSession>>;
  try {
    session = await updateSession(request);
  } catch {
    // Supabase env vars aren't configured yet (see Phase 1 plan — no live
    // project linked). Fail closed to /login with a clear signal instead
    // of a raw 500, rather than letting a misconfigured env leak a stack trace.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("config", "missing");
    return NextResponse.redirect(loginUrl);
  }
  const { response, user, accessToken } = session;

  if (!user || !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromClaims(decodeClaims(accessToken));

  if (!isRoleAllowed(protectedPrefix, role)) {
    const fallback = role ? ROLE_HOME[role] : "/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/operacional/:path*", "/admin/:path*", "/motorista/:path*"],
};
