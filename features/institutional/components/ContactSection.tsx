import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";
import { contactContent } from "@/features/institutional/content/site-copy";

export function ContactSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-brand-green-deep text-white" id="contato">
      <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-11 md:gap-16 items-start">
        <div>
          <p className="eyebrow">{contactContent.eyebrow}</p>
          <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-white mb-5">
            {contactContent.title}
          </h2>
          <p className="text-[#d7e2d3] text-[16px] max-w-[440px] mb-9">{contactContent.lead}</p>

          <div className="flex flex-col gap-5">
            <div>
              <strong className="block text-[15px] mb-1">Endereço</strong>
              <span className="text-[14px] text-[#c9d5c4]">{siteConfig.address.line}</span>
              <br />
              <a
                href={siteConfig.address.mapsUrl}
                target="_blank"
                rel="noopener"
                className="text-[14px] text-[#c9d5c4] hover:text-white"
              >
                Abrir no Google Maps →
              </a>
            </div>
            <div className="border-t border-white/15 pt-5">
              <strong className="block text-[15px] mb-1">WhatsApp / Telefone</strong>
              <a href={`tel:+${siteConfig.whatsapp.number}`} className="text-[14px] text-[#c9d5c4] hover:text-white">
                {siteConfig.whatsapp.displayNumber}
              </a>
            </div>
            <div className="border-t border-white/15 pt-5">
              <strong className="block text-[15px] mb-1">E-mail</strong>
              <a href={`mailto:${siteConfig.email}`} className="text-[14px] text-[#c9d5c4] hover:text-white">
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>

        <div className="bg-paper text-ink p-10">
          <h3 className="font-display text-[26px] mb-3.5">Pronto para agendar sua coleta?</h3>
          <p className="text-[14.5px] text-steel mb-7">
            Fale agora com a nossa equipe e receba uma resposta rápida sobre disponibilidade, prazos e
            condições para o seu estabelecimento.
          </p>
          <Button
            variant="whatsapp"
            href={buildWhatsAppLink("Olá! Quero agendar uma consulta com a MD Ambiental.")}
            target="_blank"
            rel="noopener"
            className="w-full justify-center py-4 text-[16px]"
          >
            <WhatsAppIcon className="w-[18px] h-[18px]" />
            Agendar consulta agora
          </Button>
          <span className="block font-mono text-[14px] text-steel mt-4 text-center">
            {siteConfig.whatsapp.displayNumber}
          </span>
        </div>
      </div>
    </section>
  );
}
