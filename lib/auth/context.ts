import { createClient } from "@/lib/supabase/server";
import { decodeClaims, getRoleFromClaims, getTenantIdFromClaims } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/rbac";

export type AuthContext = {
  userId: string;
  email: string | null;
  role: Role | null;
  tenantId: string | null;
};

/**
 * Server-only helper for use inside guarded route layouts/pages — the
 * middleware has already enforced that a valid session + allowed role
 * exists for this request, so this just re-reads it for display purposes
 * (name, role badge, tenant-scoped queries later).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const claims = session ? decodeClaims(session.access_token) : {};

  return {
    userId: user.id,
    email: user.email ?? null,
    role: getRoleFromClaims(claims),
    tenantId: getTenantIdFromClaims(claims),
  };
}
