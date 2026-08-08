import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/ui/LogoMark";
import { MapPinIcon } from "@/components/ui/MapPinIcon";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

const EMPRESA_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Processo" },
  { href: "#avaliacoes", label: "Avaliações" },
];

const ATENDIMENTO_LINKS = [
  { href: "#contato", label: "Contato" },
  { href: "/login", label: "Portal do cliente" },
];

export function SiteFooter() {
  return (
    <>
      <SectionDivider index={0} />
      <footer className="bg-ink text-steel-light pt-16">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr] gap-11 pb-13 border-b border-white/10">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-4 mb-6">
              <LogoMark size={60} />
              <span className="font-mono text-[26px] tracking-[0.06em] text-white uppercase font-bold">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-[14.8px] text-white text-justify max-w-[34ch] mb-5">
              Coleta, análise e destinação de óleo lubrificante usado — rastreabilidade
              do gerador ao rerrefino, em conformidade com as normas ambientais vigentes.
            </p>
          </div>

          <nav>
            <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-amber font-bold mb-4">
              Empresa
            </h4>
            <div className="flex flex-col gap-3">
              {EMPRESA_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-[13.5px] text-white hover:text-brand-amber transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <nav>
            <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-amber font-bold mb-4">
              Atendimento
            </h4>
            <div className="flex flex-col gap-3">
              {ATENDIMENTO_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-[13.5px] text-white hover:text-brand-amber transition-colors">
                  {link.label}
                </Link>
              ))}
              <a
                href={buildWhatsAppLink("Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental.")}
                target="_blank"
                rel="noopener"
                className="text-[13.5px] text-white hover:text-brand-amber transition-colors"
              >
                Agendar no WhatsApp
              </a>
            </div>
          </nav>

          <div id="contato">
            <h4 className="font-mono text-[11px] tracking-[0.08em] uppercase text-brand-amber font-bold mb-4">
              Base Piracicaba/SP
            </h4>
            <a
              href={siteConfig.address.streetViewUrl}
              target="_blank"
              rel="noopener"
              aria-label="Abrir localização da MD Ambiental no Google Street View"
              className="flex items-center justify-between gap-3 text-[13.5px] text-white mb-3 hover:text-brand-amber transition-colors"
            >
              <span>{siteConfig.address.line}</span>
              <MapPinIcon className="w-[32.7px] h-[32.7px] shrink-0 text-brand-amber" />
            </a>
            <a href={`tel:+${siteConfig.whatsapp.number}`} className="block text-[13.5px] text-white hover:text-brand-amber transition-colors mb-3">
              {siteConfig.whatsapp.displayNumber}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="block text-[13.5px] text-white hover:text-brand-amber transition-colors">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 flex justify-between flex-wrap gap-3 text-[11.5px] font-mono py-6">
          <span>
            © {new Date().getFullYear()} {siteConfig.companyName} · CNPJ {siteConfig.cnpj} · Todos os direitos reservados
          </span>
          {siteConfig.developer.name ? (
            <span className="flex items-center gap-2">
              <Image
                src="/brand/connection-cyber-icon.png"
                alt=""
                width={20}
                height={12}
                className="w-5 h-auto shrink-0"
              />
              Desenvolvido por{" "}
              {siteConfig.developer.url ? (
                <a
                  href={siteConfig.developer.url}
                  target="_blank"
                  rel="noopener"
                  className="text-brand-amber hover:text-white transition-colors"
                >
                  {siteConfig.developer.name}
                </a>
              ) : (
                <span className="text-brand-amber">{siteConfig.developer.name}</span>
              )}
            </span>
          ) : null}
        </div>
      </footer>
    </>
  );
}
