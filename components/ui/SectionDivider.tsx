/**
 * Linha fina (1px, brand-green) inserida entre seções de topo para marcar
 * o limite de cada bloco. `index` fica no tipo só para não quebrar os
 * call-sites existentes (`<SectionDivider index={n} />`), mas não é mais
 * usado — a cor agora é sempre a mesma, por pedido explícito.
 */
export function SectionDivider({ index: _index }: { index: number }) {
  return <div style={{ height: 1, backgroundColor: "#1e6b3c" }} aria-hidden="true" />;
}
