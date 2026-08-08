import Image from "next/image";
import { HeroLeadAndCtas } from "@/features/institutional/components/HeroLeadAndCtas";
import { heroContent, trustBar } from "@/features/institutional/content/site-copy";
import HeroAnimatedContainer from "./HeroAnimatedContainer";
import HeroAnimatedItem from "./HeroAnimatedItem";
import { EnvironmentalImpact } from "@/components/sections/EnvironmentalImpact";

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
      <div className="relative min-h-[calc(100svh-164px)] flex items-center">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,14,9,0.55)] via-[rgba(10,14,9,0.55)] to-[rgba(10,14,9,0.92)] -z-10" />

        {/* Container principal com justify-between e alinhamento ajustado */}
        <div className="max-w-[1180px] mx-auto px-6 w-full flex items-center justify-between">
          <HeroAnimatedContainer className="max-w-[760px] pt-10">
            <HeroAnimatedItem>
              <p className="eyebrow text-[18.5px]">{heroContent.eyebrow}</p>
            </HeroAnimatedItem>
            <HeroAnimatedItem>
              <h1 className="font-display font-semibold text-white text-left text-[clamp(14.5px,3vw,29.5px)] leading-[0.98] tracking-tight mb-6">
                {titleFirstLine}
                <br />
                {titleSecondLine}
              </h1>
            </HeroAnimatedItem>
            <HeroLeadAndCtas lead={heroContent.lead} />
          </HeroAnimatedContainer>

          {/* Cards posicionados estritamente colados na borda direita do container */}
          <div className="hidden lg:flex flex-col shrink-0 pt-12 pr-6 -mr-12">
            <EnvironmentalImpact />
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
                {/* Rótulo invertido para a linha superior */}
                <span className="font-mono text-[9.5px] text-steel-light uppercase tracking-[0.06em] block mb-0.5">
                  {item.caption}
                </span>
                {/* Valor descritivo posicionado na linha inferior */}
                <strong className="font-display text-white text-[13px] block">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}