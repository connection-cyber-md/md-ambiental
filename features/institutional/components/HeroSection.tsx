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
      <div className="relative min-h-[540px] lg:min-h-[620px] flex items-start pt-16">
        <Image
          src="/brand/caminhao-1.jpg"
          alt="Caminhão-tanque da MD Ambiental realizando coleta de óleo lubrificante"
          fill
          priority
          className="object-cover object-[center_30%] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,14,9,0.0)] via-[rgba(10,14,9,0.0)] to-[rgba(10,14,9,0.0)] -z-10" />

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
    </div>
  );
}