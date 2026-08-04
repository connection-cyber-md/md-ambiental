-- Vincula o usuário cliente@mdambiental.com (já criado no Supabase Auth)
-- a um profile 'client', ligado à empresa de amostra "Restaurante Sabor
-- [AMOSTRA]" (a mesma usada no seed_staging_sample.sql).
--
-- ONDE RODAR: Supabase Dashboard → projeto "md-ambiental-staging"
-- (ref oxsezxgzfiocpatiezhj) → SQL Editor. Não rode em produção.
-- Pré-requisito: já ter rodado supabase/seed_staging_sample.sql (para a
-- empresa 'b1a00000-0000-4000-8000-000000000001' existir).

insert into public.profiles (id, tenant_id, role, full_name, email, company_id)
values (
  '04bb5945-1066-400f-8df0-1e5126b4d425',
  '5ca33133-85a3-4dba-b567-fd05613fe1b9',
  'client',
  'Carla Cliente [TESTE]',
  'cliente@mdambiental.com',
  'b1a00000-0000-4000-8000-000000000001'
);
