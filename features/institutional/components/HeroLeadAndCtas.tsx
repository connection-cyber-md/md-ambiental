"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppLink } from "@/config/site";

// Mede a largura real da fileira de botões (w-fit, então encolhe pro
// conteúdo) e aplica essa medida como largura máxima do parágrafo acima,
// pra que a margem direita do texto bata exatamente com a borda direita
// do botão "Ver nosso processo" — em qualquer tamanho de tela, já que a
// largura dos botões não é um valor fixo (depende do texto/fonte real).
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
      <p
        className="text-[#dfe4da] text-justify text-[clamp(18.7px,1.6vw,21.7px)] mb-9"
        style={{ maxWidth: maxWidth ? `${maxWidth}px` : "600px" }}
      >
        {lead}
      </p>
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
    </>
  );
}
