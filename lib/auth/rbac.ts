export const ROLES = [
  "system_admin",
  "tenant_admin",
  "tenant_operator",
  "tenant_driver",
  "client",
] as const;

export type Role = (typeof ROLES)[number];

/** Protected route-group prefixes and which roles may access each. */
export const ROUTE_ROLE_MAP: Record<string, Role[]> = {
  "/portal": ["client"],
  "/operacional": ["tenant_admin", "tenant_operator"],
  "/motorista": ["tenant_driver"],
  "/admin": ["system_admin", "tenant_admin"],
};

/** Where each role lands after a successful login. */
export const ROLE_HOME: Record<Role, string> = {
  system_admin: "/admin",
  tenant_admin: "/admin",
  tenant_operator: "/operacional",
  tenant_driver: "/motorista",
  client: "/portal",
};

export function matchProtectedPrefix(pathname: string): string | null {
  return (
    Object.keys(ROUTE_ROLE_MAP).find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) ?? null
  );
}

export function isRoleAllowed(prefix: string, role: Role | null): boolean {
  if (!role) return false;
  return ROUTE_ROLE_MAP[prefix]?.includes(role) ?? false;
}
