import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

export function SiteFooter() {
  return (
    <>
      <SectionDivider index={0} />
      <footer className="bg-ink text-steel-light py-14">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex justify-between items-center flex-wrap gap-8 pb-9 mb-7">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-mono text-[12.5px] tracking-[0.08em] text-white uppercase">
              {siteConfig.name}
            </span>
          </Link>
          <a href={`tel:+${siteConfig.whatsapp.number}`} className="text-[14px] hover:text-white">
            {siteConfig.whatsapp.displayNumber}
          </a>
        </div>
        <div className="flex justify-between flex-wrap gap-3 text-[12.5px] font-mono">
          <span>© {new Date().getFullYear()} {siteConfig.name} — Coleta e destinação de óleo lubrificante usado</span>
          <a
            href={buildWhatsAppLink("Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental.")}
            target="_blank"
            rel="noopener"
            className="text-brand-amber"
          >
            Falar no WhatsApp →
          </a>
        </div>
      </div>
      </footer>
    </>
  );
}
