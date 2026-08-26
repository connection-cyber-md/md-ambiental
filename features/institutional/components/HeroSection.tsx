"use client";

import Image from "next/image";
import { HeroLeadAndCtas } from "@/features/institutional/components/HeroLeadAndCtas";
import { heroContent } from "@/features/institutional/content/site-copy";
import HeroAnimatedContainer from "./HeroAnimatedContainer";
import HeroAnimatedItem from "./HeroAnimatedItem";

const titleWords = heroContent.title.split(" ");
const titleFirstLine = titleWords.slice(0, -2).join(" ");
const titleSecondLine = titleWords.slice(-2).join(" ");

export function HeroSection() {
  return (
    <div id="top">
      {/* Banner Principal com altura ajustada */}
      <div className="relative min-h-[540px] lg:min-h-[620px] flex items-start pt-16 overflow-hidden">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10 brightness-105 animate-slow-zoom"
        />

        <div className="max-w-[1440px] mx-auto px-6 w-full flex items-center justify-between">
          <HeroAnimatedContainer className="max-w-[760px] pt-10">
            <HeroAnimatedItem>
              <p className="eyebrow !text-[20px] text-amber-900 font-bold">
                {heroContent.eyebrow.split(" ").slice(0, 1).join(" ")}
                <br />
                {heroContent.eyebrow.split(" ").slice(1).join(" ")}
              </p>
            </HeroAnimatedItem>
            <HeroAnimatedItem>
              <h1 className="font-display font-bold text-black text-left text-[clamp(24px,3.5vw,36px)] leading-[1.05] tracking-tight mb-6">
                {titleFirstLine}
                <br />
                {titleSecondLine}
              </h1>
            </HeroAnimatedItem>
            <HeroLeadAndCtas lead={heroContent.lead} />
          </HeroAnimatedContainer>
        </div>
      </div>
    </div>
  );
}