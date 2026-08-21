# Backoffice Administrativo

Implementado: BPO (`features/bpo`), conformidade (`features/compliance`), dashboards (`features/dashboards`),
documentos (CCO/MTR), impacto, financeiro, estoque (bases/tanques/lotes/movimentações), expedição
(destinatários/expedições/composição de lotes, com anexação do certificado de recebimento) e contratos
(geradores e destinatários) — ver `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md`.

Reservado: CRM de geradores (cadastro de `companies` ainda só via seed/banco, sem tela própria no admin).

Entrada da rota em `app/admin/page.tsx`; cada módulo é uma sub-rota (`app/admin/<modulo>/`).
