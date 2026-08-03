import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

const NAV_LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Processo" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Localização" },
];

export function SiteHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-5">
      <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/brand/logo.png" alt="MD Ambiental" width={34} height={34} className="h-8 w-auto" />
          <span className="font-mono text-[13px] tracking-[0.08em] text-white uppercase">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-[#eef0e9] opacity-85 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <a href={`tel:+${siteConfig.whatsapp.number}`} className="font-mono text-[13.5px] text-[#eef0e9] opacity-85">
            {siteConfig.whatsapp.displayNumber}
          </a>
          <Button
            href={buildWhatsAppLink(
              "Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental."
            )}
            target="_blank"
            rel="noopener"
          >
            Agendar no WhatsApp
          </Button>
        </div>

        <Link
          href="/login"
          className="md:hidden font-mono text-[12px] tracking-[0.06em] uppercase text-white border border-white/40 px-3 py-2"
        >
          Portal
        </Link>
      </div>
    </header>
  );
}
