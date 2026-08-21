-- Fundação do domínio OLUC (PRD-OLUC-001 §9.10): liga o Certificado de
-- Recebimento (document_type = 'CRC', criado na 0032) à expedição, não a
-- uma coleta — CRC é emitido pelo destinatário sobre o volume consolidado de
-- vários lotes/coletas, não sobre uma coleta individual.
--
-- Duas referências, intencionalmente não redundantes:
--   - documents.expedition_id: histórico completo de CRCs de uma expedição
--     (inclui versões substituídas — mesmo encadeamento de superseded_by
--     que 0033 já criou para CCO/MTR).
--   - expeditions.receipt_document_id (criado em 0030): ponteiro rápido pra
--     versão vigente, sem precisar filtrar o histórico a cada leitura.

alter table public.documents
  alter column collection_id drop not null,
  add column expedition_id uuid references public.expeditions(id) on delete cascade;

-- Cada linha de documents pertence a exatamente uma coisa: CCO/MTR a uma
-- coleta, CRC a uma expedição — nunca as duas, nunca nenhuma.
alter table public.documents
  add constraint documents_collection_xor_expedition check (
    (type in ('CCO', 'MTR') and collection_id is not null and expedition_id is null)
    or (type = 'CRC' and expedition_id is not null and collection_id is null)
  );

create index documents_expedition_idx on public.documents (expedition_id);
