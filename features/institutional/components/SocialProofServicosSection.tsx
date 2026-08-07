import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { CollectionTruckIcon } from "@/components/ui/ProcessIcons";
import { BadgeCheckIcon } from "@/components/ui/BadgeCheckIcon";
import { siteConfig, buildWhatsAppLink } from "@/config/site";
import { reviewsContent, services } from "@/features/institutional/content/site-copy";

const SERVICE_ICONS: Record<string, typeof CollectionTruckIcon> = {
  coleta: CollectionTruckIcon,
  especialistas: BadgeCheckIcon,
};

// Une ReviewsSection ("Prova social") e ServicosSection ("Nossos serviços")
// em duas colunas dentro do mesmo espaço, por pedido explícito. A seção
// também assume a posição que "Nossos serviços" ocupava na página (logo
// após CompromissoAmbientalSection) — substitui a antiga
// SocialProofPortalSection (Prova Social + Área do cliente); "Área do
// cliente" foi para ImpactTransparencySection.
export function SocialProofServicosSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-paper" id="avaliacoes">
      <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <p className="eyebrow">{reviewsContent.eyebrow}</p>
          <h2 className="font-display font-semibold text-[clamp(24px,2.6vw,32px)] leading-tight text-ink mb-5">
            {reviewsContent.title}
          </h2>

          <div className="flex items-center gap-4 mb-8">
            <span className="font-display text-[44px] text-ink leading-none">{reviewsContent.rating}</span>
            <div className="flex flex-col gap-1">
              <span className="text-brand-amber text-[15px] tracking-[2px]">★★★★★</span>
              <span className="font-mono text-[11.5px] text-steel uppercase tracking-[0.05em]">
                {reviewsContent.reviewCount} avaliações no Google
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {reviewsContent.reviews.map((review) => (
              <div key={review.author} className="bg-paper-dim p-6 border-l-2 border-brand-green">
                <p className="text-ink text-[14.5px] italic mb-3">&ldquo;{review.quote}&rdquo;</p>
                <span className="font-mono text-[12px] text-steel uppercase tracking-[0.05em]">
                  {review.author} — Google
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <a
              href={siteConfig.address.mapsUrl}
              target="_blank"
              rel="noopener"
              className="text-brand-green-deep hover:text-brand-amber-deep border-b border-current font-semibold text-[14px]"
            >
              Ver todas as {reviewsContent.reviewCount} avaliações no Google →
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Nossos serviços</p>
          <h2 className="font-display font-semibold text-[clamp(24px,2.6vw,32px)] leading-tight text-ink mb-8">
            Agende sua coleta e conheça nossos serviços
          </h2>

          <div className="flex flex-col gap-6">
            {services.map((service) => {
              const ServiceIcon = SERVICE_ICONS[service.slug] ?? CollectionTruckIcon;
              return (
                <Card key={service.slug} id={service.slug} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-brand-amber flex items-center justify-center shrink-0">
                      <ServiceIcon className="w-[18px] h-[18px] text-brand-green" />
                    </div>
                    <h3 className="font-display text-[22px] text-black">{service.title}</h3>
                  </div>
                  <p className="text-[14.5px] text-black">{service.description}</p>
                  <Button
                    variant="whatsapp"
                    href={buildWhatsAppLink(service.waMessage)}
                    target="_blank"
                    rel="noopener"
                    className="self-start"
                  >
                    <WhatsAppIcon className="w-[15px] h-[15px]" />
                    {service.ctaLabel}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
