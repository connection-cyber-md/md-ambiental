import Image from "next/image";
import Link from "next/link";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-steel-light py-14">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex justify-between items-start flex-wrap gap-8 pb-9 border-b border-white/15 mb-7">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/brand/logo.png" alt="MD Ambiental" width={30} height={30} className="h-[30px] w-auto" />
            <span className="font-mono text-[12.5px] tracking-[0.08em] text-white uppercase">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="flex gap-7 flex-wrap text-[14px]">
            <a href="#servicos" className="hover:text-white">Serviços</a>
            <a href="#processo" className="hover:text-white">Processo</a>
            <a href="#avaliacoes" className="hover:text-white">Avaliações</a>
            <a href="#contato" className="hover:text-white">Localização</a>
            <a href={`tel:+${siteConfig.whatsapp.number}`} className="hover:text-white">
              {siteConfig.whatsapp.displayNumber}
            </a>
          </nav>
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
  );
}
