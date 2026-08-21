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
  contact_name, contact_email, contact_phone, status, is_synthetic
)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   '11.111.111/0001-11', 'Restaurante Sabor Fictício Ltda [FICTÍCIO]', 'Sabor Fictício',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-001', 'LO', 'CETESB (fictício)',
   '2024-01-10', '2026-12-31', 'Carla Cliente', 'cliente@dev.fake', '(19) 90000-0001', 'active', true),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   '22.222.222/0001-22', 'Oficina Mecânica Fictícia Ltda [FICTÍCIO]', 'Oficina Fictícia',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-002', 'LO', 'CETESB (fictício)',
   '2024-03-01', '2026-09-30', 'Contato Oficina', 'oficina@dev.fake', '(19) 90000-0002', 'active', true),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   '33.333.333/0001-33', 'Indústria Fictícia S.A. [FICTÍCIO]', 'Indústria Fictícia',
   'Piracicaba', 'SP', '3538709', 'LO-FIC-003', 'LO', 'CETESB (fictício)',
   '2022-05-01', '2025-05-01', 'Contato Indústria', 'industria@dev.fake', '(19) 90000-0003', 'active', true);
-- ^ a terceira empresa tem license_expiry_date no passado — dado
--   proposital para testar a regra de bloqueio por licença vencida.

update public.profiles set company_id = 'b0000000-0000-4000-8000-000000000001'
  where id = 'a0000000-0000-4000-8000-0000000000a5';

-- ---------------------------------------------------------------------
-- Vehicles & drivers
-- ---------------------------------------------------------------------
insert into public.vehicles (id, tenant_id, plate, model, brand, capacity_litros, status, is_synthetic)
values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'FIC-0001', 'VM 270', 'Volvo', 8000, 'active', true),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'FIC-0002', 'Delivery Express', 'Volkswagen', 3000, 'active', true);

insert into public.drivers (id, tenant_id, profile_id, cnh_number, cnh_category, cnh_expiry, vehicle_id, status, is_synthetic)
values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-0000000000a4', 'FIC000000001', 'E', '2027-01-01', 'c0000000-0000-4000-8000-000000000001', 'active', true),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-0000000000a6', 'FIC000000002', 'D', '2027-06-01', 'c0000000-0000-4000-8000-000000000002', 'active', true);

-- ---------------------------------------------------------------------
-- Collections — variedade de status.
-- ---------------------------------------------------------------------
insert into public.collections (id, tenant_id, company_id, driver_id, vehicle_id, collection_date, volume_litros, status, notes, is_synthetic)
values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', now() - interval '20 days', 450, 'completed', 'Coleta fictícia concluída.', true),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', now() - interval '14 days', 180, 'completed', 'Coleta fictícia concluída.', true),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', now() - interval '7 days', 900, 'completed', 'Coleta fictícia concluída.', true),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', now() - interval '2 days', 300, 'in_progress', 'Coleta fictícia em andamento.', true),
  ('e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', null, null, now() + interval '3 days', null, 'scheduled', 'Coleta fictícia agendada.', true),
  ('e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', null, null, now() - interval '1 days', null, 'canceled', 'Coleta fictícia cancelada pelo cliente.', true);

-- ---------------------------------------------------------------------
-- Documents (CCO/MTR) — ligados às coletas concluídas.
-- ---------------------------------------------------------------------
insert into public.documents (id, tenant_id, collection_id, type, document_number, file_url, issue_date, status, is_synthetic)
values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'CCO', 'CCO-FIC-0001', 'https://example.invalid/dev/cco-fic-0001.pdf', now() - interval '19 days', 'issued', true),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'CCO', 'CCO-FIC-0002', 'https://example.invalid/dev/cco-fic-0002.pdf', now() - interval '13 days', 'issued', true),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'MTR', 'MTR-FIC-0001', 'https://example.invalid/dev/mtr-fic-0001.pdf', now() - interval '6 days', 'issued', true);

-- ---------------------------------------------------------------------
-- BPO tasks — algumas por departamento.
-- ---------------------------------------------------------------------
insert into public.bpo_tasks (tenant_id, department, title, description, status, due_date, assigned_to, is_synthetic)
values
  ('a0000000-0000-4000-8000-000000000001', 'comercial', 'Enviar proposta fictícia para novo lead', 'Follow-up automático pós-cadastro.', 'pending', current_date + 3, 'a0000000-0000-4000-8000-0000000000a2', true),
  ('a0000000-0000-4000-8000-000000000001', 'operacional', 'Revisar manutenção preventiva do veículo FIC-0001', 'Baseado em km rodado (dado fictício).', 'in_progress', current_date + 5, 'a0000000-0000-4000-8000-0000000000a3', true),
  ('a0000000-0000-4000-8000-000000000001', 'administrativo', 'Emitir CCO da coleta e0000000-...-003', 'Pendente de conferência.', 'done', current_date - 2, 'a0000000-0000-4000-8000-0000000000a2', true),
  ('a0000000-0000-4000-8000-000000000001', 'financeiro', 'Conciliar faturamento fictício do mês', 'Rotina mensal.', 'pending', current_date + 10, 'a0000000-0000-4000-8000-0000000000a2', true),
  ('a0000000-0000-4000-8000-000000000001', 'rh', 'Renovar treinamento de segurança do motorista', 'Trilha obrigatória (dado fictício).', 'blocked', current_date + 15, 'a0000000-0000-4000-8000-0000000000a3', true);

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

-- ---------------------------------------------------------------------
-- Domínio OLUC (estoque/custódia — supabase/migrations/0027 a 0034).
-- Cenário com duas histórias em paralelo:
--   lote k1 (tanque h1) — ainda aberto, ilustra estoque em andamento.
--   lote k2 (tanque h2) — recebido, expedido e conciliado até o CRC,
--   ilustra o ciclo de custódia completo de ponta a ponta.
-- Sem is_synthetic em bases/tanks/destinatarios: são estrutura/cadastro,
-- não dado transacional (mesmo critério de financial_accounts/categories).
-- ---------------------------------------------------------------------

insert into public.bases (id, tenant_id, name, address_cidade, address_uf, capacity_total_litros, is_active)
values
  ('g0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Base Piracicaba [FICTÍCIA]', 'Piracicaba', 'SP', 16000, true);

insert into public.tanks (id, tenant_id, base_id, code, capacity_litros, material_class, status)
values
  ('h0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'g0000000-0000-4000-8000-000000000001', 'T-01', 8000, 'oleo_usado_classe_a', 'active'),
  ('h0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'g0000000-0000-4000-8000-000000000001', 'T-02', 8000, 'oleo_usado_classe_a', 'active');

-- Lotes já com o volume resultante das movimentações abaixo (450+180 no k1;
-- 900-900 no k2) — o script insere o estado final, as stock_movements abaixo
-- são a trilha de auditoria de como se chegou lá, não o inverso.
insert into public.lots (id, tenant_id, tank_id, code, quality_classification, volume_litros, status, opened_at)
values
  ('k0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000001', 'LOTE-FIC-0001', 'Classe A (fictício)', 630, 'open', now() - interval '20 days'),
  ('k0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000002', 'LOTE-FIC-0002', 'Classe A (fictício)', 0, 'expedited', now() - interval '7 days');

insert into public.stock_movements (id, tenant_id, tank_id, lot_id, collection_id, type, volume_litros, reason, created_by, created_at, is_synthetic)
values
  ('l0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000001', 'k0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'entrada', 450, 'Entrada da coleta fictícia e1.', 'a0000000-0000-4000-8000-0000000000a3', now() - interval '20 days', true),
  ('l0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000001', 'k0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'entrada', 180, 'Entrada da coleta fictícia e2.', 'a0000000-0000-4000-8000-0000000000a3', now() - interval '14 days', true),
  ('l0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000002', 'k0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000003', 'entrada', 900, 'Entrada da coleta fictícia e3.', 'a0000000-0000-4000-8000-0000000000a3', now() - interval '7 days', true),
  ('l0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'h0000000-0000-4000-8000-000000000002', 'k0000000-0000-4000-8000-000000000002', null, 'expedicao', -900, 'Expedição fictícia n1 para a Rerrefinaria Fictícia.', 'a0000000-0000-4000-8000-0000000000a2', now() - interval '3 days', true);

insert into public.samples (id, tenant_id, collection_id, seal_code, classification, contaminants_declared, status, reviewed_by, reviewed_at, is_synthetic)
values
  ('i0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'LACRE-FIC-0001', 'Classe A — baixo teor de água (fictício)', 'Nenhum contaminante aparente (fictício).', 'approved', 'a0000000-0000-4000-8000-0000000000a2', now() - interval '19 days', true),
  ('i0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'LACRE-FIC-0002', 'Classe A (fictício)', null, 'approved', 'a0000000-0000-4000-8000-0000000000a2', now() - interval '13 days', true),
  ('i0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'LACRE-FIC-0003', null, null, 'pending', null, null, true);
-- ^ a amostra i3 fica 'pending' de propósito — ilustra a fila de revisão de
--   qualidade que a operação ainda precisa aprovar.

insert into public.evidences (id, tenant_id, collection_id, type, file_url, latitude, longitude, captured_by, captured_at, is_synthetic)
values
  ('j0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'photo', 'https://example.invalid/dev/evidencia-fic-0001.jpg', null, null, 'a0000000-0000-4000-8000-0000000000a4', now() - interval '20 days', true),
  ('j0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'signature', 'https://example.invalid/dev/assinatura-fic-0001.png', null, null, 'a0000000-0000-4000-8000-0000000000a4', now() - interval '20 days', true),
  ('j0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'geolocation', null, -22.725300, -47.649200, 'a0000000-0000-4000-8000-0000000000a4', now() - interval '20 days', true);

insert into public.destinatarios (id, tenant_id, cnpj, razao_social, nome_fantasia, authorization_number, authorization_expiry_date, address_cidade, address_uf, contact_name, contact_email, contact_phone, status)
values
  ('m0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '44.444.444/0001-44', 'Rerrefinaria Fictícia S.A. [FICTÍCIA]', 'Rerrefinaria Fictícia', 'ANP-FIC-001', '2027-01-01', 'Paulínia', 'SP', 'Contato Rerrefinaria', 'rerrefinaria@dev.fake', '(19) 90000-0004', 'active');

insert into public.expeditions (id, tenant_id, destinatario_id, vehicle_id, driver_id, expedition_date, total_volume_litros, status, notes, reconciled_at, is_synthetic)
values
  ('n0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'm0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', now() - interval '3 days', 900, 'reconciled', 'Expedição fictícia consolidando o lote LOTE-FIC-0002.', now() - interval '1 days', true);

insert into public.expedition_lots (id, tenant_id, expedition_id, lot_id, volume_litros, is_synthetic)
values
  ('o0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'n0000000-0000-4000-8000-000000000001', 'k0000000-0000-4000-8000-000000000002', 900, true);

-- CRC (certificado de recebimento) da expedição n1 — precisa existir depois
-- da expedição (FK), e a expedição referencia o CRC de volta
-- (receipt_document_id) — resolvido com o UPDATE logo abaixo, mesmo padrão
-- já usado acima pra profiles.company_id.
insert into public.documents (id, tenant_id, type, expedition_id, document_number, issue_date, verification_code, status, is_synthetic)
values
  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'CRC', 'n0000000-0000-4000-8000-000000000001', 'CRC-FIC-0001', (now() - interval '2 days')::date, 'FICCRC0001', 'issued', true);

update public.expeditions set receipt_document_id = 'f0000000-0000-4000-8000-000000000004'
  where id = 'n0000000-0000-4000-8000-000000000001';

insert into public.contracts (id, tenant_id, party_type, company_id, destinatario_id, start_date, price_per_litro, sla_hours, status, notes, is_synthetic)
values
  ('p0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'gerador', 'b0000000-0000-4000-8000-000000000001', null, '2025-01-01', 1.20, 48, 'active', 'Contrato fictício de coleta recorrente com o Restaurante Sabor Fictício.', true),
  ('p0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'destinatario', null, 'm0000000-0000-4000-8000-000000000001', '2025-01-01', 0.85, null, 'active', 'Contrato fictício de fornecimento à Rerrefinaria Fictícia.', true);
