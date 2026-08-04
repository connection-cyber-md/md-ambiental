import type { Role } from "@/lib/auth/rbac";

type Claims = {
  tenant_id?: string;
  app_role?: Role;
  [key: string]: unknown;
};

/**
 * Decodes the (already-validated) JWT payload to read the custom claims
 * injected by the `custom_access_token_hook` Postgres function
 * (see supabase/migrations/0018_fix_reserved_role_claim.sql) — namely
 * `tenant_id` and `app_role`. NOTE: our app-level role lives in `app_role`,
 * not `role` — `role` is reserved by PostgREST (it does `SET ROLE <that
 * claim>` on the Postgres connection), so overwriting it with values like
 * "tenant_admin" broke every data-table query with
 * `role "tenant_admin" does not exist` (see 0018 for the full story).
 * Supabase's client SDK does not surface arbitrary custom claims on the
 * `User` object, so we decode the token payload ourselves. This does not
 * re-verify the signature: only call it after `supabase.auth.getUser()`
 * has already succeeded for this request, which revalidates the token
 * against the Auth server.
 */
export function decodeClaims(accessToken: string): Claims {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return {};
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as Claims;
  } catch {
    return {};
  }
}

export function getRoleFromClaims(claims: Claims): Role | null {
  return (claims.app_role as Role) ?? null;
}

export function getTenantIdFromClaims(claims: Claims): string | null {
  return claims.tenant_id ?? null;
}
