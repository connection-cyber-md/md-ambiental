import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost-dark" | "ghost-light" | "line";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-amber text-white hover:bg-brand-amber-deep shadow-sm hover:-translate-y-px",
  "ghost-dark":
    "border border-white/35 text-white hover:border-white hover:bg-white/10",
  "ghost-light":
    "border border-ink text-ink hover:bg-ink hover:text-paper",
  line: "text-brand-green-deep hover:text-brand-amber-deep border-b border-current px-0 py-0 rounded-none font-semibold",
};

const base =
  "inline-flex items-center gap-2.5 font-semibold text-[15px] px-6 py-3.5 rounded-sm transition-all duration-200 whitespace-nowrap";

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
