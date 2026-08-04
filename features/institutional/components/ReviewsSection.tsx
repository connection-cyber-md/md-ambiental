import { siteConfig } from "@/config/site";
import { reviewsContent } from "@/features/institutional/content/site-copy";

export function ReviewsSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-paper" id="avaliacoes">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex justify-between items-end gap-8 flex-wrap mb-14">
          <div>
            <p className="eyebrow">{reviewsContent.eyebrow}</p>
            <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-ink">
              {reviewsContent.title}
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-display text-[52px] md:text-[64px] text-ink leading-none">
              {reviewsContent.rating}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-brand-amber text-[16px] tracking-[2px]">★★★★★</span>
              <span className="font-mono text-[12.5px] text-steel uppercase tracking-[0.05em]">
                {reviewsContent.reviewCount} avaliações no Google
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsContent.reviews.map((review) => (
            <div key={review.author} className="bg-paper-dim p-8 border-l-2 border-brand-green">
              <p className="text-ink text-[15px] italic mb-5">&ldquo;{review.quote}&rdquo;</p>
              <span className="font-mono text-[12.5px] text-steel uppercase tracking-[0.05em]">
                {review.author} — Google
              </span>
            </div>
          ))}
        </div>

        <div className="mt-9">
          <a
            href={siteConfig.address.mapsUrl}
            target="_blank"
            rel="noopener"
            className="text-brand-green-deep hover:text-brand-amber-deep border-b border-current font-semibold"
          >
            Ver todas as {reviewsContent.reviewCount} avaliações no Google →
          </a>
        </div>
      </div>
    </section>
  );
}
