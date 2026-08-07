import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppLink } from "@/config/site";
import { heroContent, trustBar } from "@/features/institutional/content/site-copy";

// Título em duas linhas fixas: tudo menos as duas últimas palavras na
// primeira linha, as duas últimas na segunda ("...óleo" / "lubrificante usado.").
const titleWords = heroContent.title.split(" ");
const titleFirstLine = titleWords.slice(0, -2).join(" ");
const titleSecondLine = titleWords.slice(-2).join(" ");

// Antes era um card flutuante ("Ficha de coleta") sobre a foto do hero;
// virou uma segunda barra, no mesmo formato da trustBar, logo abaixo dela.
const collectionSheet = [
  { value: "Resíduo classe I", caption: "Classe" },
  { value: "OLUC", caption: "Material" },
  { value: "Piracicaba/SP", caption: "Base" },
  { value: "ANP vigente", caption: "Autorização" },
  { value: "Rerrefino", caption: "Destinação" },
];

export function HeroSection() {
  return (
    <div id="top">
      {/* 100svh menos a altura do header (~81px) e da faixa de confiança
          logo abaixo (~83px), para que Hero + faixa caibam na tela sem
          rolar ao abrir a página. Ajuste fino pode ser necessário conforme
          o navegador/fonte real. */}
      <div className="relative min-h-[calc(100svh-164px)] flex items-start">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,14,9,0.55)] via-[rgba(10,14,9,0.55)] to-[rgba(10,14,9,0.92)] -z-10" />

        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <div className="max-w-[760px] pt-10">
            <p className="eyebrow text-[14.5px]">{heroContent.eyebrow}</p>
            <h1 className="font-display font-semibold text-white text-left text-[clamp(36px,6vw,66px)] leading-[0.98] tracking-tight mb-6">
              {titleFirstLine}
              <br />
              {titleSecondLine}
            </h1>
            <p className="text-[#dfe4da] text-left text-[clamp(16px,1.6vw,19px)] max-w-[600px] mb-9">
              {heroContent.lead}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="whatsapp"
                href={buildWhatsAppLink(
                  "Olá! Quero agendar uma coleta de óleo lubrificante com a MD Ambiental."
                )}
                target="_blank"
                rel="noopener"
              >
                <WhatsAppIcon className="w-[18px] h-[18px]" />
                Agendar consulta
              </Button>
              <Button variant="ghost-dark" href="#processo">
                Ver nosso processo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-amber/25">
        <div className="bg-ink">
          <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap">
            {trustBar.map((item, i) => (
              <div
                key={item.label}
                className={`flex-1 min-w-[220px] py-5 px-6 flex items-center gap-3 ${
                  i < trustBar.length - 1 ? "border-r border-brand-amber/25" : ""
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
        <div className="bg-black border-t border-brand-amber/25">
          <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap">
            {collectionSheet.map((item, i) => (
              <div
                key={item.caption}
                className={`flex-1 min-w-[140px] py-3.5 px-6 ${
                  i < collectionSheet.length - 1 ? "border-r border-brand-amber/25" : ""
                }`}
              >
                <strong className="font-display text-white text-[13px] block">{item.value}</strong>
                <span className="font-mono text-[9.5px] text-steel-light uppercase tracking-[0.06em]">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
