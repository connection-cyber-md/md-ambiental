-- =====================================================================
-- FICTITIOUS DEVELOPMENT SEED DATA — DO NOT USE IN PRODUCTION
--
-- Every identifier here (CNPJ, plates, names, addresses) is fake. Not
-- auto-applied by any migration. Run manually against a LOCAL
-- `supabase start` stack only, e.g.:
--   npm run supabase:reset   (runs all migrations, then this file)
-- Never point this at the real md-ambiental / md-ambiental-staging
-- hosted Supabase projects.
--
-- Dev login password for every seeded user below: devpassword123
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tenant
-- ---------------------------------------------------------------------
insert into public.tenants (id, cnpj, razao_social, nome_fantasia, status)
values (
  'a0000000-0000-4000-8000-000000000001',
  '00.000.000/0001-00',
  'MD Ambiental [DADOS FICTÍCIOS]',
  'MD Ambiental (Dev)',
  'active'
);

-- ---------------------------------------------------------------------
-- Auth users (one per role) + matching profiles.
-- Inserting directly into auth.users is the standard local-stack-only
-- technique for seeding logins without going through the signup flow.
-- ---------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated',
   'admin.sistema@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated',
   'admin@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a3', 'authenticated', 'authenticated',
   'operador@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a4', 'authenticated', 'authenticated',
   'motorista@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a6', 'authenticated', 'authenticated',
   'motorista2@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a5', 'authenticated', 'authenticated',
   'cliente@dev.fake', crypt('devpassword123', gen_salt('bf')), now(), '{}', '{}', now(), now(), '', '');

insert into public.profiles (id, tenant_id, role, full_name, email)
values
  ('a0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-000000000001', 'system_admin', 'Admin Sistema [FICTÍCIO]', 'admin.sistema@dev.fake'),
  ('a0000000-0000-4000-8000-0000000000a2', 'a0000000-0000-4000-8000-000000000001', 'tenant_admin', 'Ana Administradora [FICTÍCIA]', 'admin@dev.fake'),
  ('a0000000-0000-4000-8000-0000000000a3', 'a0000000-0000-4000-8000-000000000001', 'tenant_operator', 'Otávio Operador [FICTÍCIO]', 'operador@dev.fake'),
  ('a0000000-0000-4000-8000-0000000000a4', 'a0000000-0000-4000-8000-000000000001', 'tenant_driver', 'Marcos Motorista [FICTÍCIO]', 'motorista@dev.fake'),
  ('a0000000-0000-4000-8000-0000000000a6', 'a0000000-0000-4000-8000-000000000001', 'tenant_driver', 'Diego Motorista [FICTÍCIO]', 'motorista2@dev.fake'),
  ('a0000000-0000-4000-8000-0000000000a5', 'a0000000-0000-4000-8000-000000000001', 'client', 'Carla Cliente [FICTÍCIA]', 'cliente@dev.fake');

-- ---------------------------------------------------------------------
-- Companies (clientes geradores) — uma com licença vencida, para
-- exercitar o bloqueio do futuro Motor de Conformidade.
-- ---------------------------------------------------------------------
insert into public.companies (
  id, tenant_id, cnpj, razao_social, nome_fantasia,
  address_cidade, address_uf, ibge_code,
  license_number, license_type, license_issuing_agency,
  license_issue_date, license_expiry_date,
  contact_name, contact_email, contact_phone, status
)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   '11.111.111/0001-11', 'Restaurante Sabor Fictício Ltda [FICTÍCIO]', 'Sabor Fictício',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-001', 'LO', 'CETESB (fictício)',
   '2024-01-10', '2026-12-31', 'Carla Cliente', 'cliente@dev.fake', '(19) 90000-0001', 'active'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   '22.222.222/0001-22', 'Oficina Mecânica Fictícia Ltda [FICTÍCIO]', 'Oficina Fictícia',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-002', 'LO', 'CETESB (fictício)',
   '2024-03-01', '2026-09-30', 'Contato Oficina', 'oficina@dev.fake', '(19) 90000-0002', 'active'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   '33.333.333/0001-33', 'Indústria Fictícia S.A. [FICTÍCIO]', 'Indústria Fictícia',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-003', 'LO', 'CETESB (fictício)',
   '2022-05-01', '2025-05-01', 'Contato Indústria', 'industria@dev.fake', '(19) 90000-0003', 'active');
-- ^ a terceira empresa tem license_expiry_date no passado — dado
--   proposital para testar a regra de bloqueio por licença vencida.

update public.profiles set company_id = 'b0000000-0000-4000-8000-000000000001'
  where id = 'a0000000-0000-4000-8000-0000000000a5';

-- ---------------------------------------------------------------------
-- Vehicles & drivers
-- ---------------------------------------------------------------------
insert into public.vehicles (id, tenant_id, plate, model, brand, capacity_litros, status)
values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'FIC-0001', 'VM 270', 'Volvo', 8000, 'active'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'FIC-0002', 'Delivery Express', 'Volkswagen', 3000, 'active');

insert into public.drivers (id, tenant_id, profile_id, cnh_number, cnh_category, cnh_expiry, vehicle_id, status)
values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-0000000000a4', 'FIC000000001', 'E', '2027-01-01', 'c0000000-0000-4000-8000-000000000001', 'active'),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-0000000000a6', 'FIC000000002', 'D', '2027-06-01', 'c0000000-0000-4000-8000-000000000002', 'active');

-- ---------------------------------------------------------------------
-- Collections — variedade de status.
-- ---------------------------------------------------------------------
insert into public.collections (id, tenant_id, company_id, driver_id, vehicle_id, collection_date, volume_litros, status, notes)
values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', now() - interval '20 days', 450, 'completed', 'Coleta fictícia concluída.'),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', now() - interval '14 days', 180, 'completed', 'Coleta fictícia concluída.'),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', now() - interval '7 days', 900, 'completed', 'Coleta fictícia concluída.'),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', now() - interval '2 days', 300, 'in_progress', 'Coleta fictícia em andamento.'),
  ('e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', null, null, now() + interval '3 days', null, 'scheduled', 'Coleta fictícia agendada.'),
  ('e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', null, null, now() - interval '1 days', null, 'canceled', 'Coleta fictícia cancelada pelo cliente.');

-- ---------------------------------------------------------------------
-- Documents (CCO/MTR) — ligados às coletas concluídas.
-- ---------------------------------------------------------------------
insert into public.documents (id, tenant_id, collection_id, type, document_number, file_url, issue_date, status)
values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'CCO', 'CCO-FIC-0001', 'https://example.invalid/dev/cco-fic-0001.pdf', now() - interval '19 days', 'issued'),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'CCO', 'CCO-FIC-0002', 'https://example.invalid/dev/cco-fic-0002.pdf', now() - interval '13 days', 'issued'),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'MTR', 'MTR-FIC-0001', 'https://example.invalid/dev/mtr-fic-0001.pdf', now() - interval '6 days', 'issued');

-- ---------------------------------------------------------------------
-- BPO tasks — algumas por departamento.
-- ---------------------------------------------------------------------
insert into public.bpo_tasks (tenant_id, department, title, description, status, due_date, assigned_to)
values
  ('a0000000-0000-4000-8000-000000000001', 'comercial', 'Enviar proposta fictícia para novo lead', 'Follow-up automático pós-cadastro.', 'pending', current_date + 3, 'a0000000-0000-4000-8000-0000000000a2'),
  ('a0000000-0000-4000-8000-000000000001', 'operacional', 'Revisar manutenção preventiva do veículo FIC-0001', 'Baseado em km rodado (dado fictício).', 'in_progress', current_date + 5, 'a0000000-0000-4000-8000-0000000000a3'),
  ('a0000000-0000-4000-8000-000000000001', 'administrativo', 'Emitir CCO da coleta e0000000-...-003', 'Pendente de conferência.', 'done', current_date - 2, 'a0000000-0000-4000-8000-0000000000a2'),
  ('a0000000-0000-4000-8000-000000000001', 'financeiro', 'Conciliar faturamento fictício do mês', 'Rotina mensal.', 'pending', current_date + 10, 'a0000000-0000-4000-8000-0000000000a2'),
  ('a0000000-0000-4000-8000-000000000001', 'rh', 'Renovar treinamento de segurança do motorista', 'Trilha obrigatória (dado fictício).', 'blocked', current_date + 15, 'a0000000-0000-4000-8000-0000000000a3');

-- ---------------------------------------------------------------------
-- Dashboards metrics — algumas linhas para os futuros dashboards.
-- ---------------------------------------------------------------------
insert into public.dashboards_metrics (tenant_id, metric_key, metric_value, scope, period_start, period_end, metadata)
values
  ('a0000000-0000-4000-8000-000000000001', 'fleet_efficiency_l_per_km', 12.4, 'operacional', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "ficticio"}'),
  ('a0000000-0000-4000-8000-000000000001', 'compliance_rate', 0.92, 'compliance', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "ficticio"}'),
  ('a0000000-0000-4000-8000-000000000001', 'nps', 78, 'ceo', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "ficticio"}');

-- ---------------------------------------------------------------------
-- Regulatory matrix — linhas ilustrativas para Piracicaba/SP (IBGE
-- 3538709). Conteúdo simplificado para desenvolvimento; NÃO é parecer
-- jurídico/regulatório validado.
-- ---------------------------------------------------------------------
insert into public.regulatory_matrix (ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law)
values
  ('3538709', 'SP', 'federal', 'Cadastro Técnico Federal (IBAMA)', 'Exigência de CTF/APP para coletores de óleo lubrificante usado (ilustrativo).', array['CTF'], null, 'Res. ANP 362/05 (ilustrativo)'),
  ('3538709', 'SP', 'estadual', 'MTR via SIGOR (CETESB)', 'Manifesto de Transporte de Resíduos obrigatório para o estado de SP (ilustrativo).', array['MTR'], 'expired_operating_license', 'SIGOR/CETESB (ilustrativo)'),
  ('3538709', 'SP', 'municipal', 'Restrição de horário para caminhões', 'Janela de circulação de caminhões de carga na área urbana (ilustrativo).', array[]::text[], null, 'Secretaria de Transportes de Piracicaba (ilustrativo)');
