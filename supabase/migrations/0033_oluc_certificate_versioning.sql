-- Fundação do domínio OLUC (PRD-OLUC-001 §9.7): versionamento e verificação
-- pública de certificados. "Um certificado emitido não deverá ser alterado
-- silenciosamente" — correção gera novo documento (version + 1) apontado por
-- superseded_by no original, nunca um update in-place do conteúdo emitido.
--
-- verification_code é o valor curto embutido no QR Code do certificado; a
-- rota pública de verificação (fora do escopo desta migration) faz lookup só
-- por esse código, nunca pelo id interno.

alter table public.documents
  add column verification_code text,
  add column version integer not null default 1,
  add column superseded_by uuid references public.documents(id) on delete set null,
  add column notes text;

create unique index documents_verification_code_key
  on public.documents (verification_code)
  where verification_code is not null;
