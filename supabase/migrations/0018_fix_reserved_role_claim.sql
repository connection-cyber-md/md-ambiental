-- Corrige uma colisão de nomes: o hook (0014) gravava o papel do usuário
-- (tenant_admin, system_admin...) na claim "role" do JWT. Só que "role" é
-- reservada pelo PostgREST — ele usa essa claim para fazer SET ROLE na
-- conexão Postgres que executa a query. Como "tenant_admin" não é um papel
-- real do Postgres, toda consulta via API de dados (PostgREST) falhava com
-- "role \"tenant_admin\" does not exist", mesmo com RLS/policies corretas.
-- O login em si (GoTrue) não passa por esse caminho, por isso não
-- aparecia até agora, quando as telas do backoffice fizeram a primeira
-- consulta real via .from(...).select(...).
--
-- Fix: renomeia nossa claim de aplicação para "app_role", sem tocar na
-- claim "role" (que o Supabase já preenche sozinho com "authenticated").

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
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_profile.role::text));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

create or replace function public.is_system_admin()
returns boolean
language sql
stable
as $$
  select (auth.jwt() ->> 'app_role') = 'system_admin'
$$;

create or replace function public.current_role_claim()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'app_role'
$$;
