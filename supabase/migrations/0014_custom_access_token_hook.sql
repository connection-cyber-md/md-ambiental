-- Custom Access Token Hook: called by Supabase Auth at token-issuance time.
-- Injects tenant_id and role (read from public.profiles) into the JWT's
-- claims. Every RLS policy in this schema depends on these claims via
-- public.tenant_id()/public.is_system_admin()/public.current_role_claim()
-- (0003_helper_functions.sql) — without this hook registered, those
-- functions evaluate to null/false and every tenant-scoped policy denies
-- access (fail closed, not fail open).
--
-- Registration happens in supabase/config.toml:
--   [auth.hook.custom_access_token]
--   enabled = true
--   uri = "pg-functions://postgres/public/custom_access_token_hook"

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_profile record;
begin
  select tenant_id, role
    into user_profile
    from public.profiles
    where id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  if user_profile is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_profile.tenant_id::text));
    claims := jsonb_set(claims, '{role}', to_jsonb(user_profile.role::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The Auth service (not application users) calls this hook — restrict
-- execution accordingly, per Supabase's documented pattern for access
-- token hooks.
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

grant usage on schema public to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;
