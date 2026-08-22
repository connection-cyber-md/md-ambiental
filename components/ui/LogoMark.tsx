import Image from "next/image";

// Logo oficial do projeto (arquivo real fornecido pelo cliente MD Ambiental).
// Usado em todo lugar que exibir a logo (header do site, login, backoffice, PDFs)
// para garantir que seja sempre a mesma marca, não uma versão diferente por tela.
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="MD Ambiental"
      width={0}
      height={0}
      sizes="100vw"
      priority
      className={`w-auto object-contain shrink-0 ${className ?? ""}`}
      style={{ height: size, width: "auto" }}
    />
  );
}