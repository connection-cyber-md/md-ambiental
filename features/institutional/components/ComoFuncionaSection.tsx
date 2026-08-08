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

function StepNode({
  step,
  Icon,
  active,
  animated,
  delayMs,
}: {
  step: (typeof processContent.steps)[number];
  Icon: (typeof STEP_ICONS)[number];
  active: boolean;
  animated?: boolean;
  delayMs?: number;
}) {
  return (
    <div
      className={`relative ${animated ? "transition-all duration-500 ease-out" : ""} ${
        animated && !active ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
      }`}
      style={animated ? { transitionDelay: `${delayMs ?? 0}ms` } : undefined}
    >
      <div
        className={`absolute -left-16 top-0 w-10 h-10 rounded-full border flex items-center justify-center bg-ink transition-colors duration-300 ${
          active ? "border-brand-amber text-brand-green" : "border-white/15 text-steel-light"
        }`}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <h3 className="font-display text-[21px] text-white mb-2">{step.title}</h3>
      <p className="text-steel-light text-[15px] max-w-[420px]">{step.description}</p>
    </div>
  );
}

export function ComoFuncionaSection() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  const desktopWrapperRef = useRef<HTMLDivElement | null>(null);
  const [desktopInView, setDesktopInView] = useState(false);

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

  useEffect(() => {
    const el = desktopWrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDesktopInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fillPercent = (visibleCount / processContent.steps.length) * 100;
  const stepsCol2 = processContent.steps.slice(0, 3);
  const stepsCol3 = processContent.steps.slice(3, 5);

  return (
    <section className="py-20 md:py-28 bg-ink text-paper" id="processo">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.9fr_2fr] gap-16 items-start">
          <div>
            <div className="max-w-[520px] mb-8">
              <p className="eyebrow text-[25px]">{processContent.eyebrow}</p>
              <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-white">
                {processContent.title}
              </h2>
            </div>

            <div className="max-w-[520px] text-[15.5px] flex flex-col gap-4">
              {processContent.intro.map((paragraph) => (
                <p key={paragraph} className="text-white text-justify">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Versão linear — mobile e tablet (abaixo de lg): uma linha só,
              1→5, com o preenchimento progressivo já existente. */}
          <div className="lg:hidden relative pl-16">
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
                  className="pb-12 last:pb-0"
                >
                  <StepNode step={step} Icon={StepIcon} active={i < visibleCount} />
                </div>
              );
            })}
          </div>

          {/* Versão serpentina — desktop (lg+): coluna 2 com os 3 primeiros
              passos, coluna 3 alinhada ao topo com os 2 últimos, ligadas por
              uma curva decorativa. Entrada em cascata (um de cada vez) ao
              entrar na tela, em vez de acompanhar o scroll passo a passo
              como a versão linear. */}
          <div ref={desktopWrapperRef} className="hidden lg:grid lg:grid-cols-2 lg:gap-x-10 relative">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 47 58 C 58 58, 58 30, 68 30"
                fill="none"
                stroke="#1e6b3c"
                strokeWidth="0.5"
                strokeDasharray="60"
                className="transition-[stroke-dashoffset] duration-700 ease-out"
                style={{ strokeDashoffset: desktopInView ? 0 : 60, transitionDelay: "450ms" }}
              />
            </svg>

            <div className="pl-16 flex flex-col gap-10">
              <div className="absolute left-5 top-2.5 w-px h-[calc(66%-14px)] bg-gradient-to-b from-brand-amber to-brand-green" />
              {stepsCol2.map((step, i) => (
                <StepNode
                  key={step.num}
                  step={step}
                  Icon={STEP_ICONS[i] ?? CalendarIcon}
                  active={desktopInView}
                  animated
                  delayMs={i * 150}
                />
              ))}
            </div>

            <div className="pl-16 flex flex-col gap-10">
              {stepsCol3.map((step, i) => (
                <StepNode
                  key={step.num}
                  step={step}
                  Icon={STEP_ICONS[i + 3] ?? CalendarIcon}
                  active={desktopInView}
                  animated
                  delayMs={(i + 3) * 150}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
