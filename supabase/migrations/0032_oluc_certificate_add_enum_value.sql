-- Novo tipo de documento: Certificado de Recebimento (destinatário/
-- rerrefinador confirma o volume recebido — PRD-OLUC-001 §9.10). Em
-- migration própria: Postgres não permite usar um valor de enum recém-criado
-- na mesma transação em que ele foi adicionado.
alter type public.document_type add value 'CRC';
