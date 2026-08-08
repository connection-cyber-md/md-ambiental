import { Card } from "@/components/ui/Card";
import { buildWhatsAppLink } from "@/config/site";
import { services } from "@/features/institutional/content/site-copy";

export function ServicosSection() {
  return (
    <section className="py-20 md:py-28 bg-brand-green-soft" id="servicos">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-[640px] mb-14">
          <p className="eyebrow">Nossos serviços</p>
          <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-ink">
            Agende sua coleta e conheça nossos serviços
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {services.map((service) => (
            <Card key={service.slug} id={service.slug} className="flex flex-col gap-5">
              <span className="font-mono text-[12px] text-brand-amber tracking-[0.08em]">
                {service.index}
              </span>
              <h3 className="font-display text-[26px] text-ink">{service.title}</h3>
              <p className="text-[15px] text-steel">{service.description}</p>
              <a
                href={buildWhatsAppLink(service.waMessage)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 self-start mt-2 border border-ink text-ink px-6 py-3.5 text-[15px] font-semibold hover:bg-ink hover:text-paper transition-colors"
              >
                {service.ctaLabel} →
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
