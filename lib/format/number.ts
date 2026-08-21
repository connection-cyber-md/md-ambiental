// Parser para números digitados em formulários no formato brasileiro
// (vírgula decimal, ponto como separador de milhar opcional). Usado pelos
// módulos OLUC (contratos/estoque/expedição) e deveria substituir o padrão
// `raw.replace(",", ".")` espalhado nesses actions — esse padrão só troca a
// primeira ocorrência de vírgula e quebra em valores com separador de
// milhar (ex: "1.234,56" vira "1.234.56", que Number() lê como NaN).
export function parseLocaleNumber(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return NaN;

  if (trimmed.includes(",")) {
    // Vírgula presente => é o separador decimal; qualquer ponto antes dela
    // é separador de milhar e deve ser removido.
    return Number(trimmed.replace(/\./g, "").replace(",", "."));
  }

  return Number(trimmed);
}
