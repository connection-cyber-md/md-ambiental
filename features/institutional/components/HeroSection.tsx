import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/config/site";
import { heroContent, trustBar } from "@/features/institutional/content/site-copy";

export function HeroSection() {
  return (
    <div id="top">
      <div className="relative min-h-[100svh] flex items-end pt-32">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,14,9,0.55)] via-[rgba(10,14,9,0.55)] to-[rgba(10,14,9,0.92)] -z-10" />

        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <div className="max-w-[760px] pb-24">
            <p className="eyebrow">{heroContent.eyebrow}</p>
            <h1 className="font-display font-semibold text-white text-[clamp(38px,6vw,68px)] leading-[1.08] tracking-tight mb-6">
              {heroContent.title}
            </h1>
            <p className="text-[#dfe4da] text-[clamp(16px,1.6vw,19px)] max-w-[600px] mb-9">
              {heroContent.lead}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                href={buildWhatsAppLink(
                  "Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental."
                )}
                target="_blank"
                rel="noopener"
              >
                Agendar consulta no WhatsApp
              </Button>
              <Button variant="ghost-dark" href="#processo">
                Ver nosso processo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ink border-t border-white/15">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap">
          {trustBar.map((item, i) => (
            <div
              key={item.label}
              className={`flex-1 min-w-[220px] py-5 px-6 flex items-center gap-3 ${
                i < trustBar.length - 1 ? "border-r border-white/15" : ""
              }`}
            >
              <div>
                <strong className="font-display text-white text-[17px] block">{item.label}</strong>
                <span className="font-mono text-[11.5px] text-steel-light uppercase tracking-[0.06em]">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
