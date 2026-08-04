-- =====================================================================
-- DADOS DE AMOSTRA PARA O STAGING REAL (hosted) — NÃO é o supabase/seed.sql
-- ⚠ Leia antes de rodar.
--
-- Por que este arquivo existe: já havia um `supabase/seed.sql` no projeto,
-- mas ele cria tenant + usuários inserindo direto em `auth.users` — técnica
-- que só funciona numa stack LOCAL (`supabase start`, via Docker). No
-- projeto staging hospedado (o que o `npm run dev` deste ambiente usa),
-- `auth.users` é gerenciado pelo GoTrue e não deve ser escrito via INSERT
-- direto. Por isso este arquivo NÃO recria tenant/usuários — ele reaproveita
-- o tenant e o usuário admin reais que você já criou no staging durante a
-- validação do login (ver Adendo ao Parecer Técnico, seção 3):
--   tenant_id: 5ca33133-85a3-4dba-b567-fd05613fe1b9
--   admin.profile_id (admin@mdambiental.com): 5807d5af-2051-4e01-a219-7085749657f8
--
-- Só insere companies, vehicles, collections, documents, bpo_tasks,
-- dashboards_metrics e regulatory_matrix — nada que exija criar um usuário
-- novo em auth.users (por isso não há "drivers": a FK drivers.profile_id
-- exige um profile real, e collections/vehicles não precisam de driver
-- para funcionar; driver_id fica null nas linhas abaixo).
--
-- ONDE RODAR — confirme antes de executar:
--   Supabase Dashboard → projeto "md-ambiental-staging" (ref oxsezxgzfiocpatiezhj,
--   URL https://oxsezxgzfiocpatiezhj.supabase.co) → SQL Editor → colar e
--   rodar este arquivo inteiro.
--   NÃO rode no projeto de produção (dvrajadmqcixaccqpmnh).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Companies (clientes geradores) — uma com licença vencendo em breve
-- (para popular o KPI "Licenças vencendo"), uma já vencida, uma tranquila.
-- ---------------------------------------------------------------------
insert into public.companies (
  id, tenant_id, cnpj, razao_social, nome_fantasia,
  address_cidade, address_uf, ibge_code,
  license_number, license_type, license_issuing_agency,
  license_issue_date, license_expiry_date,
  contact_name, contact_email, contact_phone, status
)
values
  ('b1a00000-0000-4000-8000-000000000001', '5ca33133-85a3-4dba-b567-fd05613fe1b9',
   '11.111.111/0001-11', 'Restaurante Sabor [AMOSTRA]', 'Sabor',
   'Piracicaba', 'SP', '3538709', 'LO-AM-001', 'LO', 'CETESB',
   '2024-01-10', current_date + 15, 'Contato Sabor', 'contato.sabor@exemplo.invalid', '(19) 90000-0001', 'active'),
  ('b1a00000-0000-4000-8000-000000000002', '5ca33133-85a3-4dba-b567-fd05613fe1b9',
   '22.222.222/0001-22', 'Oficina Mecânica [AMOSTRA]', 'Oficina',
   'Piracicaba', 'SP', '3538709', 'LO-AM-002', 'LO', 'CETESB',
   '2024-03-01', current_date + 240, 'Contato Oficina', 'contato.oficina@exemplo.invalid', '(19) 90000-0002', 'active'),
  ('b1a00000-0000-4000-8000-000000000003', '5ca33133-85a3-4dba-b567-fd05613fe1b9',
   '33.333.333/0001-33', 'Indústria [AMOSTRA]', 'Indústria',
   'Piracicaba', 'SP', '3538709', 'LO-AM-003', 'LO', 'CETESB',
   '2022-05-01', current_date - 60, 'Contato Indústria', 'contato.industria@exemplo.invalid', '(19) 90000-0003', 'active');
-- ^ Indústria [AMOSTRA] tem licença vencida há 60 dias (não entra no KPI
--   "vencendo em 30 dias" porque já passou — fica pra quando o Motor de
--   Conformidade tratar "já vencida" como caso à parte).

-- ---------------------------------------------------------------------
-- Vehicles (sem FK para profiles, seguro inserir).
-- ---------------------------------------------------------------------
insert into public.vehicles (id, tenant_id, plate, model, brand, capacity_litros, status)
values
  ('c1a00000-0000-4000-8000-000000000001', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'AMO-0001', 'VM 270', 'Volvo', 8000, 'active'),
  ('c1a00000-0000-4000-8000-000000000002', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'AMO-0002', 'Delivery Express', 'Volkswagen', 3000, 'active');

-- ---------------------------------------------------------------------
-- Collections — datas dentro do mês corrente (date_trunc('month', now())),
-- para aparecerem no KPI "Coletas (mês)" independente de que dia do mês
-- você rodar isto. driver_id fica null (nenhum profile de motorista real
-- ainda existe no staging).
-- ---------------------------------------------------------------------
insert into public.collections (id, tenant_id, company_id, driver_id, vehicle_id, collection_date, volume_litros, status, notes)
values
  ('e1a00000-0000-4000-8000-000000000001', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000001', null, 'c1a00000-0000-4000-8000-000000000001', date_trunc('month', now()) + interval '2 days', 450, 'completed', 'Coleta de amostra concluída.'),
  ('e1a00000-0000-4000-8000-000000000002', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000002', null, 'c1a00000-0000-4000-8000-000000000002', date_trunc('month', now()) + interval '5 days', 180, 'completed', 'Coleta de amostra concluída.'),
  ('e1a00000-0000-4000-8000-000000000003', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000003', null, 'c1a00000-0000-4000-8000-000000000001', date_trunc('month', now()) + interval '9 days', 900, 'completed', 'Coleta de amostra concluída.'),
  ('e1a00000-0000-4000-8000-000000000004', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000001', null, 'c1a00000-0000-4000-8000-000000000002', date_trunc('month', now()) + interval '12 days', 300, 'in_progress', 'Coleta de amostra em andamento.'),
  ('e1a00000-0000-4000-8000-000000000005', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000002', null, null, date_trunc('month', now()) + interval '20 days', null, 'scheduled', 'Coleta de amostra agendada.'),
  ('e1a00000-0000-4000-8000-000000000006', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'b1a00000-0000-4000-8000-000000000003', null, null, date_trunc('month', now()) + interval '15 days', null, 'canceled', 'Coleta de amostra cancelada.');

-- ---------------------------------------------------------------------
-- Documents (CCO/MTR) — ligados às coletas concluídas.
-- ---------------------------------------------------------------------
insert into public.documents (id, tenant_id, collection_id, type, document_number, file_url, issue_date, status)
values
  ('f1a00000-0000-4000-8000-000000000001', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'e1a00000-0000-4000-8000-000000000001', 'CCO', 'CCO-AM-0001', 'https://example.invalid/amostra/cco-am-0001.pdf', date_trunc('month', now()) + interval '2 days', 'issued'),
  ('f1a00000-0000-4000-8000-000000000002', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'e1a00000-0000-4000-8000-000000000002', 'CCO', 'CCO-AM-0002', 'https://example.invalid/amostra/cco-am-0002.pdf', date_trunc('month', now()) + interval '5 days', 'issued'),
  ('f1a00000-0000-4000-8000-000000000003', '5ca33133-85a3-4dba-b567-fd05613fe1b9', 'e1a00000-0000-4000-8000-000000000003', 'MTR', 'MTR-AM-0001', 'https://example.invalid/amostra/mtr-am-0001.pdf', date_trunc('month', now()) + interval '9 days', 'issued');

-- ---------------------------------------------------------------------
-- BPO tasks — algumas atribuídas ao admin real (assigned_to), outras sem
-- responsável.
-- ---------------------------------------------------------------------
insert into public.bpo_tasks (tenant_id, department, title, description, status, due_date, assigned_to)
values
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'comercial', 'Enviar proposta para novo lead [AMOSTRA]', 'Follow-up pós-cadastro.', 'pending', current_date + 3, '5807d5af-2051-4e01-a219-7085749657f8'),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'operacional', 'Revisar manutenção preventiva do veículo AMO-0001 [AMOSTRA]', 'Baseado em km rodado.', 'in_progress', current_date + 5, null),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'administrativo', 'Emitir CCO da coleta e1a00000-...-003 [AMOSTRA]', 'Pendente de conferência.', 'done', current_date - 2, '5807d5af-2051-4e01-a219-7085749657f8'),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'financeiro', 'Conciliar faturamento do mês [AMOSTRA]', 'Rotina mensal.', 'pending', current_date + 10, null),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'rh', 'Renovar treinamento de segurança [AMOSTRA]', 'Trilha obrigatória.', 'blocked', current_date + 15, null);

-- ---------------------------------------------------------------------
-- Dashboards metrics — algumas linhas para os futuros dashboards.
-- ---------------------------------------------------------------------
insert into public.dashboards_metrics (tenant_id, metric_key, metric_value, scope, period_start, period_end, metadata)
values
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'fleet_efficiency_l_per_km', 12.4, 'operacional', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "amostra"}'),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'compliance_rate', 0.92, 'compliance', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "amostra"}'),
  ('5ca33133-85a3-4dba-b567-fd05613fe1b9', 'nps', 78, 'ceo', date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '{"fonte": "amostra"}');

-- ---------------------------------------------------------------------
-- Regulatory matrix — global (sem tenant_id), ilustrativo para
-- Piracicaba/SP (IBGE 3538709). NÃO é parecer jurídico validado.
-- ---------------------------------------------------------------------
insert into public.regulatory_matrix (ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law)
values
  ('3538709', 'SP', 'federal', 'Cadastro Técnico Federal (IBAMA)', 'Exigência de CTF/APP para coletores de óleo lubrificante usado (ilustrativo).', array['CTF'], null, 'Res. ANP 362/05 (ilustrativo)'),
  ('3538709', 'SP', 'estadual', 'MTR via SIGOR (CETESB)', 'Manifesto de Transporte de Resíduos obrigatório para o estado de SP (ilustrativo).', array['MTR'], 'expired_operating_license', 'SIGOR/CETESB (ilustrativo)'),
  ('3538709', 'SP', 'municipal', 'Restrição de horário para caminhões', 'Janela de circulação de caminhões de carga na área urbana (ilustrativo).', array[]::text[], null, 'Secretaria de Transportes de Piracicaba (ilustrativo)');
