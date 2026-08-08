import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { reviewsContent, portalCta } from "@/features/institutional/content/site-copy";

// Une ReviewsSection ("Prova social") e PortalClienteCTA ("Área do cliente")
// em duas colunas dentro do mesmo espaço, por pedido explícito — antes eram
// duas seções empilhadas.
export function SocialProofPortalSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-paper" id="avaliacoes">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14">
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

        <div className="bg-black p-10 flex flex-col justify-center">
          <p className="eyebrow">{portalCta.eyebrow}</p>
          <h2 className="font-display font-semibold text-[28px] text-white mb-3">{portalCta.title}</h2>
          <p className="text-[#d7e2d3] text-[15px] mb-7">{portalCta.body}</p>
          <Button href="/login" variant="ghost-dark" className="self-start">
            {portalCta.ctaLabel} →
          </Button>
        </div>
      </div>
    </section>
  );
}
