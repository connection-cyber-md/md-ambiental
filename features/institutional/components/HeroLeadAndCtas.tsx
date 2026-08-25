"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppLink } from "@/config/site";
import HeroAnimatedItem from "./HeroAnimatedItem";

export function HeroLeadAndCtas({ lead }: { lead: string }) {
  const ctasRef = useRef<HTMLDivElement | null>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ctasRef.current;
    if (!el) return;

    const update = () => setMaxWidth(el.getBoundingClientRect().width);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeroAnimatedItem>
        <p
          className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-justify text-[clamp(18.7px,1.6vw,21.7px)] mb-9 font-medium"
          style={{ maxWidth: maxWidth ? `${maxWidth}px` : "600px" }}
        >
          {lead}
        </p>
      </HeroAnimatedItem>
      
      <HeroAnimatedItem>
        <div ref={ctasRef} className="w-fit flex gap-4 flex-wrap">
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
      </HeroAnimatedItem>
    </>
  );
}