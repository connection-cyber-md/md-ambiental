// Logo oficial do projeto (arquivo real fornecido pelo cliente MD Ambiental).
// Usado em todo lugar que exibir a logo (header do site, login, backoffice, PDFs)
// para garantir que seja sempre a mesma marca, não uma versão diferente por tela.
// eslint-disable-next-line @next/next/no-img-element -- svg/raster fixo, dimensionado via height
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/logo.png"
      alt="MD Ambiental"
      className={`w-auto object-contain shrink-0 ${className ?? ""}`}
      style={{ height: size }}
    />
  );
}
