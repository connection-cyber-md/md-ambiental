import Link from "next/link";
import { Button, buttonBaseClasses, buttonUnifiedColorClasses } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { LogoMark } from "@/components/ui/LogoMark";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

// Mesmas classes de tamanho/fonte/cor do <Button>, para que "Entrar" e
// "Agendar" fiquem exatamente do mesmo tamanho.
const entrarClasses = `${buttonBaseClasses} ${buttonUnifiedColorClasses}`;

const NAV_LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Processo" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Localização" },
  // TODO: ainda não existe seção/página de FAQ no site — este link fica
  // apontando para uma âncora vazia até o conteúdo (perguntas e
  // respostas reais) ser definido.
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-black py-4 border-b border-white/10">
      <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={49.3} />
          <span className="font-mono text-[15.7px] tracking-[0.08em] text-white uppercase">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[14.5px] text-[#eef0e9] opacity-85 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <a
            href="#sobre"
            className="font-mono text-[14.5px] text-[#eef0e9] opacity-85 hover:opacity-100 transition-opacity"
          >
            Sobre
          </a>
          <Link href="/login" className={entrarClasses}>
            Entrar
          </Link>
          <Button
            variant="whatsapp"
            href={buildWhatsAppLink(
              "Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental."
            )}
            target="_blank"
            rel="noopener"
          >
            <WhatsAppIcon className="w-[18px] h-[18px]" />
            Agendar
          </Button>
        </div>

        <Link href="/login" className={`md:hidden ${entrarClasses}`}>
          Portal
        </Link>
      </div>
    </header>
  );
}
