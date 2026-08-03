import type { Role } from "@/lib/auth/rbac";

type Claims = {
  tenant_id?: string;
  role?: Role;
  [key: string]: unknown;
};

/**
 * Decodes the (already-validated) JWT payload to read the custom claims
 * injected by the `custom_access_token_hook` Postgres function
 * (see supabase/migrations/0014_custom_access_token_hook.sql) — namely
 * `tenant_id` and `role`. Supabase's client SDK does not surface arbitrary
 * custom claims on the `User` object, so we decode the token payload
 * ourselves. This does not re-verify the signature: only call it after
 * `supabase.auth.getUser()` has already succeeded for this request, which
 * revalidates the token against the Auth server.
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
  return (claims.role as Role) ?? null;
}

export function getTenantIdFromClaims(claims: Claims): string | null {
  return claims.tenant_id ?? null;
}
