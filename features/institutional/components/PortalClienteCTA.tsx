import { Button } from "@/components/ui/Button";
import { portalCta } from "@/features/institutional/content/site-copy";

export function PortalClienteCTA() {
  return (
    <section className="py-[40px] bg-black">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-8 flex-wrap">
        <div className="max-w-[560px]">
          <p className="eyebrow">{portalCta.eyebrow}</p>
          <h2 className="font-display font-semibold text-[28px] text-white mb-2">{portalCta.title}</h2>
          <p className="text-[#d7e2d3] text-[15px]">{portalCta.body}</p>
        </div>
        <Button href="/login" variant="ghost-dark">
          {portalCta.ctaLabel} →
        </Button>
      </div>
    </section>
  );
}
