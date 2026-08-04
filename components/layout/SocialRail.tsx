import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

const iconClasses =
  "w-8 h-8 rounded-full bg-ink border border-brand-amber text-brand-green flex items-center justify-center hover:bg-ink-soft hover:border-brand-amber-deep transition-colors";

// Faixa flutuante de redes sociais, fixa na lateral esquerda, visível em
// todas as páginas do site (renderizada no layout). Instagram/Facebook/
// LinkedIn ainda usam link placeholder ("#") — ver TODO em config/site.ts.
export function SocialRail() {
  return (
    <div className="hidden md:flex flex-col gap-3 fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <a href={siteConfig.social.instagram} target="_blank" rel="noopener" aria-label="Instagram" className={iconClasses}>
        <InstagramIcon className="w-[16px] h-[16px]" />
      </a>
      <a href={siteConfig.social.facebook} target="_blank" rel="noopener" aria-label="Facebook" className={iconClasses}>
        <FacebookIcon className="w-[16px] h-[16px]" />
      </a>
      <a href={siteConfig.social.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className={iconClasses}>
        <LinkedinIcon className="w-[16px] h-[16px]" />
      </a>
      <a
        href={buildWhatsAppLink("Olá! Quero falar com a MD Ambiental.")}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className={iconClasses}
      >
        <WhatsAppIcon className="w-[16px] h-[16px]" />
      </a>
    </div>
  );
}
