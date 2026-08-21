-- Correções de robustez no domínio OLUC (0027-0031), levantadas em review:
--
-- 1) contracts.company_id / contracts.destinatario_id foram criadas com
--    "on delete cascade" (0031), diferente do padrão já usado pelo resto do
--    schema pra FKs de companies/destinatarios em tabelas transacionais
--    (collections.company_id usa "on delete restrict" desde 0009). Isso é
--    perigoso combinado com scripts/reset-synthetic-data.ts: o script apaga
--    companies/destinatarios sintéticos por último, e com cascade qualquer
--    contrato REAL (is_synthetic = false) preso a uma empresa/destinatário
--    sintético seria apagado silenciosamente — violando a garantia
--    documentada no próprio script ("Dado real nunca é tocado"). Trocamos
--    para "on delete restrict", alinhando com collections/vehicles/etc: não
--    é possível apagar uma empresa/destinatário que ainda tem contrato.
alter table public.contracts
  drop constraint contracts_company_id_fkey,
  add constraint contracts_company_id_fkey
    foreign key (company_id) references public.companies(id) on delete restrict;

alter table public.contracts
  drop constraint contracts_destinatario_id_fkey,
  add constraint contracts_destinatario_id_fkey
    foreign key (destinatario_id) references public.destinatarios(id) on delete restrict;

-- 2) Índices em tenant_id: toda tabela tenant-scoped existente indexa
--    tenant_id (ver 0015_indexes.sql, 0024_financial_module.sql), porque
--    toda policy de RLS filtra por ele. As tabelas OLUC (0027-0031) ficaram
--    de fora dessa convenção.
create index if not exists bases_tenant_idx on public.bases (tenant_id);
create index if not exists tanks_tenant_idx on public.tanks (tenant_id);
create index if not exists lots_tenant_idx on public.lots (tenant_id);
create index if not exists stock_movements_tenant_idx on public.stock_movements (tenant_id);
create index if not exists evidences_tenant_idx on public.evidences (tenant_id);
create index if not exists samples_tenant_idx on public.samples (tenant_id);
create index if not exists destinatarios_tenant_idx on public.destinatarios (tenant_id);
create index if not exists expeditions_tenant_idx on public.expeditions (tenant_id);
create index if not exists expedition_lots_tenant_idx on public.expedition_lots (tenant_id);
create index if not exists contracts_tenant_idx on public.contracts (tenant_id);
