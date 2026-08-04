import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost-dark" | "ghost-light" | "line" | "whatsapp";

// Exportadas para o "Entrar" do header poder usar exatamente o mesmo
// tamanho/fonte/cor do <Button>, garantindo que os dois fiquem idênticos
// em vez de só parecidos.
export const buttonUnifiedColorClasses =
  "bg-ink text-brand-green border-[1.5px] border-brand-amber hover:bg-ink-soft hover:border-brand-amber-deep";

// Fonte/tamanho iguais aos do botão "Entrar": mono, caixa alta, tracking.
// Comprimento (+2px de padding horizontal) e altura (+1px de padding
// vertical) em relação ao tamanho anterior do "Entrar".
export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2.5 font-mono text-[12.5px] tracking-[0.06em] uppercase px-[18px] py-[11px] rounded-full transition-all duration-200 whitespace-nowrap";

const unified = buttonUnifiedColorClasses;

// Todos os variantes "de botão" (exceto o link de texto "line") usam o mesmo
// visual: fundo preto, borda âmbar, texto/ícone verde. Mantido como Record
// para não quebrar os call-sites existentes (`variant="ghost-dark"` etc.).
const variantClasses: Record<Variant, string> = {
  primary: unified,
  "ghost-dark": unified,
  "ghost-light": unified,
  line: "text-brand-green-deep hover:text-brand-amber-deep border-b border-current px-0 py-0 rounded-none font-semibold normal-case tracking-normal",
  whatsapp: unified,
};

const base = buttonBaseClasses;

export function Button({
  variant = "primary",
  className,
  href,
  ...props
}: {
  variant?: Variant;
} & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
)) {
  const classes = cn(base, variantClasses[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {props.children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {props.children}
    </button>
  );
}
