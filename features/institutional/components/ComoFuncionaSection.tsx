"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  CollectionTruckIcon,
  AnalysisIcon,
  SeparationIcon,
  DistributionIcon,
} from "@/components/ui/ProcessIcons";
import { processContent } from "@/features/institutional/content/site-copy";

// Um ícone por etapa, na mesma ordem de processContent.steps
// (Agendamento, Coleta, Análise, Separação, Distribuição).
const STEP_ICONS = [CalendarIcon, CollectionTruckIcon, AnalysisIcon, SeparationIcon, DistributionIcon];

export function ComoFuncionaSection() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            setVisibleCount((count) => Math.max(count, index + 1));
          }
        });
      },
      { threshold: 0.4 }
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fillPercent = (visibleCount / processContent.steps.length) * 100;

  return (
    <section className="py-20 md:py-28 bg-ink text-paper" id="processo">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="max-w-[520px] mb-8">
              <p className="eyebrow">{processContent.eyebrow}</p>
              <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-white">
                {processContent.title}
              </h2>
            </div>

            <div className="max-w-[520px] text-steel-light text-[15.5px] flex flex-col gap-4">
              {processContent.intro.map((paragraph) => (
                <p key={paragraph} className="text-steel-light">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="relative pl-16">
            <div className="absolute left-5 top-2.5 bottom-2.5 w-px bg-white/15">
              <div
                className="absolute left-0 top-0 w-full bg-gradient-to-b from-brand-amber to-brand-green transition-[height] duration-[1400ms] ease-out"
                style={{ height: `${fillPercent}%` }}
              />
            </div>

            {processContent.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i] ?? CalendarIcon;
              return (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative pb-12 last:pb-0"
                >
                  <div
                    className={`absolute -left-16 top-0 w-10 h-10 rounded-full border flex items-center justify-center bg-ink transition-colors duration-300 ${
                      i < visibleCount ? "border-brand-amber text-brand-green" : "border-white/15 text-steel-light"
                    }`}
                  >
                    <StepIcon className="w-[18px] h-[18px]" />
                  </div>
                  <h3 className="font-display text-[21px] text-white mb-2">{step.title}</h3>
                  <p className="text-steel-light text-[15px] max-w-[420px]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
