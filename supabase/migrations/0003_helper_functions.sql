-- Helper functions wrapping auth.jwt() so every RLS policy stays DRY and
-- reads from a single source of truth. Depend on the custom claims injected
-- by the access token hook in 0014_custom_access_token_hook.sql — until that
-- hook is registered (supabase/config.toml), these evaluate to null/false
-- and every tenant-scoped policy below denies access by default (fail closed).
--
-- Living in `public` (not `auth`) is intentional: on hosted Supabase projects
-- the migration role does not have CREATE privilege on the `auth` schema
-- (it's owned/managed by the platform), so custom claim-reader functions must
-- live in a schema we own. This is the officially recommended pattern.

create or replace function public.tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid
$$;

create or replace function public.is_system_admin()
returns boolean
language sql
stable
as $$
  select (auth.jwt() ->> 'role') = 'system_admin'
$$;

create or replace function public.current_role_claim()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'role'
$$;
