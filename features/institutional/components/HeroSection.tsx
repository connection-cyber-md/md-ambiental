import Image from "next/image";
import { HeroLeadAndCtas } from "@/features/institutional/components/HeroLeadAndCtas";
import { heroContent, trustBar } from "@/features/institutional/content/site-copy";
import HeroAnimatedContainer from "./HeroAnimatedContainer";
import HeroAnimatedItem from "./HeroAnimatedItem";
import { EnvironmentalImpact } from "@/components/sections/EnvironmentalImpact";
import { LogoMarquee } from "@/components/sections/LogoMarquee";

// Título em duas linhas fixas: tudo menos as duas últimas palavras na
// primeira linha, as duas últimas na segunda ("...óleo" / "lubrificante usado.").
const titleWords = heroContent.title.split(" ");
const titleFirstLine = titleWords.slice(0, -2).join(" ");
const titleSecondLine = titleWords.slice(-2).join(" ");

// Ficha de coleta ajustada com a inversão: rótulo menor em cima e valor em destaque embaixo
const collectionSheet = [
  { value: "Resíduo classe I", caption: "Classe" },
  { value: "OLUC", caption: "Material" },
  { value: "Piracicaba/SP", caption: "Base" },
  { value: "ANP vigente", caption: "Autorização" },
  { value: "Rerrefino", caption: "Destinação" },
];

// Mapeamento de cores sequenciais idênticas às Métricas de Impacto (Verde, Rosa, Amarelo, Laranja)
const cardBorderColors = [
  "border-emerald-500/50 hover:border-emerald-500",
  "border-rose-500/50 hover:border-rose-500",
  "border-amber-500/50 hover:border-amber-500",
  "border-orange-500/50 hover:border-orange-500",
];

export function HeroSection() {
  return (
    <div id="top">
      {/* Banner Principal com altura ajustada */}
      <div className="relative min-h-[540px] lg:min-h-[620px] flex items-start pt-16">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,14,9,0.55)] via-[rgba(10,14,9,0.55)] to-[rgba(10,14,9,0.92)] -z-10" />

        <div className="max-w-[1440px] mx-auto px-6 w-full flex items-center justify-between">
          <HeroAnimatedContainer className="max-w-[760px] pt-10">
            <HeroAnimatedItem>
              <p className="eyebrow !text-[20px]">
                {heroContent.eyebrow.split(" ").slice(0, 1).join(" ")}
                <br />
                {heroContent.eyebrow.split(" ").slice(1).join(" ")}
              </p>
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
        </div>
      </div>

      {/* Barra de Logos Infinita */}
      <LogoMarquee />

      {/* Faixa de Rodapé Unificada: 3 Colunas Distribuídas Igualmente */}
      <div className="border-t border-brand-amber/25 bg-black">
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* 1ª Coluna: Credibilidade (Fundo transparente) */}
          <div className="flex flex-col gap-4 p-5 border border-brand-amber/25 h-full">
            <span className="font-mono text-[10px] text-brand-amber uppercase tracking-[0.1em]">01 / Credibilidade</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trustBar.map((item, index) => {
                const colorClass = cardBorderColors[index % cardBorderColors.length];
                return (
                  <div key={item.label} className={`flex flex-col justify-between p-3.5 bg-black/40 border rounded-lg ${colorClass} transition-colors`}>
                    <span className="font-display text-white text-[15px] block font-normal mb-1">{item.label}</span>
                    <span className="font-mono text-[11px] text-steel-light uppercase tracking-[0.06em] font-normal">
                      {item.caption}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2ª Coluna: Ficha Técnica (Fundo transparente) */}
          <div className="flex flex-col gap-4 p-5 border border-brand-amber/25 h-full">
            <span className="font-mono text-[10px] text-brand-amber uppercase tracking-[0.1em]">02 / Ficha Técnica</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {collectionSheet.map((item, index) => {
                const colorClass = cardBorderColors[index % cardBorderColors.length];
                return (
                  <div key={item.caption} className={`flex flex-col justify-between p-3.5 bg-black/40 border rounded-lg ${colorClass} transition-colors`}>
                    <span className="font-mono text-[10px] text-steel-light uppercase tracking-[0.06em] block mb-1 font-normal">
                      {item.caption}
                    </span>
                    <span className="font-display text-white text-[13.5px] block font-normal">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3ª Coluna: Métricas de Impacto (Fundo transparente) */}
          <div className="flex flex-col gap-4 p-5 border border-brand-amber/25 h-full">
            <span className="font-mono text-[10px] text-brand-amber uppercase tracking-[0.1em]">03 / Métricas de Impacto</span>
            <div className="w-full">
              <EnvironmentalImpact />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}