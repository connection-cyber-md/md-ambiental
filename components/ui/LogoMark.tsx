// Logo padrão do projeto: selo redondo preto, borda âmbar, "MD" em verde.
// Usado em todo lugar que exibir a logo (header do site, login, backoffice)
// para garantir que seja sempre a mesma marca, não uma versão diferente por tela.
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <span
      className={`rounded-full bg-ink border-[1.5px] border-brand-amber flex items-center justify-center font-mono font-bold text-brand-green shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.31) }}
      aria-hidden="true"
    >
      MD
    </span>
  );
}
