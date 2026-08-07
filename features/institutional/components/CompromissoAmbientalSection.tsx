import Image from "next/image";
import { missionContent } from "@/features/institutional/content/site-copy";

// Últimas duas palavras do eyebrow ("MD Ambiental") em negrito — mesmo
// truque de split usado no título do hero.
const eyebrowWords = missionContent.eyebrow.split(" ");
const eyebrowRest = eyebrowWords.slice(0, -2).join(" ");
const eyebrowBrand = eyebrowWords.slice(-2).join(" ");

export function CompromissoAmbientalSection() {
  return (
    <section className="py-[50px] md:py-[70px] bg-paper" id="sobre">
      <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-11 md:gap-16 items-center">
        <div>
          <p className="eyebrow text-[13.8px]">
            {eyebrowRest} <strong className="font-bold">{eyebrowBrand}</strong>
          </p>
          <p className="font-display font-medium text-black text-[19px] leading-snug mb-7">
            {missionContent.lead}
          </p>
          <p className="text-[15.5px] text-black text-justify mb-8">{missionContent.body}</p>
          <ul className="flex flex-col gap-4">
            {missionContent.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3.5 items-start text-[15px] text-black font-medium">
                <span className="w-[7px] h-[7px] rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-first md:order-last">
          <div className="relative aspect-[4/3]">
            <Image
              src="/brand/caminhao-6.webp"
              alt="Caminhão-tanque da MD Ambiental em operação"
              fill
              className="object-cover rounded-sm shadow-2xl"
            />
          </div>
          <div className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mt-3.5 flex justify-between">
            <span>Frota própria</span>
            <span>Piracicaba · SP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
