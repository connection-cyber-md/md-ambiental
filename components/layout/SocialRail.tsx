import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

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
    </div>
  );
}
