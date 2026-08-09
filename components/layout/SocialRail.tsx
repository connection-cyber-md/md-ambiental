import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";
import { MapPin } from "lucide-react"; // Importação do ícone de localização

const iconClasses =
  "w-8 h-8 md:w-[54px] md:h-[54px] rounded-full bg-ink border border-brand-amber flex items-center justify-center hover:bg-ink-soft hover:border-brand-amber-deep transition-colors";

const glyphClasses = "w-4 h-4 md:w-[22px] md:h-[22px]";

// Faixa flutuante de redes sociais, fixa na lateral esquerda, visível em
// todas as páginas do site (renderizada no layout) — inclusive no mobile,
// em tamanho original (32px/16px); a partir do breakpoint md passa para o
// tamanho ampliado (54px/22px). Instagram/Facebook/LinkedIn ainda usam link
// placeholder ("#") — ver TODO em config/site.ts.
export function SocialRail() {
  return (
    <div className="flex flex-col gap-2.5 md:gap-3 fixed left-3 md:left-4 top-1/2 -translate-y-1/2 z-40">
      <a href={siteConfig.social.instagram} target="_blank" rel="noopener" aria-label="Instagram" className={iconClasses}>
        <InstagramIcon className={`${glyphClasses} text-[#E1306C]`} />
      </a>
      <a href={siteConfig.social.facebook} target="_blank" rel="noopener" aria-label="Facebook" className={iconClasses}>
        <FacebookIcon className={`${glyphClasses} text-[#1877F2]`} />
      </a>
      <a href={siteConfig.social.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className={iconClasses}>
        <LinkedinIcon className={`${glyphClasses} text-[#0A66C2]`} />
      </a>
      <a
        href={buildWhatsAppLink("Olá! Quero falar com a MD Ambiental.")}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className={iconClasses}
      >
        <WhatsAppIcon className={`${glyphClasses} text-[#25D366]`} />
      </a>
      
      {/* Botão de Localização injetado na última posição do trilho com o link definitivo */}
      <a
        href="https://www.google.com/maps/place/Av.+S%C3%A3o+Paulo,+2115+-+Centro+(Tupi),+Piracicaba+-+SP,+13401-541/@-22.7570671,-47.6459738,17z/data=!3m1!4b1!4m6!3m5!1s0x94c6308aaddcc3cb:0x2523423a82508a87!8m2!3d-22.7570671!4d-47.6459738!16s%2Fg%2F11nxbn64c2?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener"
        aria-label="Localização"
        className={iconClasses}
      >
        <MapPin className={`${glyphClasses} text-brand-amber`} strokeWidth={1.8} />
      </a>
    </div>
  );
}