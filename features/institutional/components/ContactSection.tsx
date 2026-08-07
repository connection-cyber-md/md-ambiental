import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";

// Antes tinha uma coluna de endereço/telefone/e-mail ao lado do CTA — removida
// porque essa informação já está no rodapé (SiteFooter). Fica só o CTA.
export function ContactSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-brand-green-deep" id="contato">
      <div className="max-w-[560px] mx-auto px-6">
        <div className="bg-paper text-ink p-10 text-center">
          <h2 className="font-display text-[26px] mb-3.5">Pronto para agendar sua coleta?</h2>
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
