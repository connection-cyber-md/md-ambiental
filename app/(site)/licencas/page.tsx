import type { Metadata } from "next";
import { transparencyContent } from "@/features/institutional/content/site-copy";

export const metadata: Metadata = {
  title: "Transparência e Licenças",
};

export default function LicencasPage() {
  return (
    <section className="py-28 pt-40 bg-paper min-h-[60vh]">
      <div className="max-w-[760px] mx-auto px-6">
        <p className="eyebrow">{transparencyContent.eyebrow}</p>
        <h1 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-ink mb-6">
          {transparencyContent.title}
        </h1>
        <p className="text-[16px] text-steel mb-8">{transparencyContent.lead}</p>
        <ul className="flex flex-col gap-4 mb-10">
          {transparencyContent.items.map((item) => (
            <li key={item} className="flex gap-3 items-start text-[15px] font-medium text-ink">
              <span className="w-[7px] h-[7px] rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[14px] text-steel-light border-t border-ink/10 pt-6">
          Números de licença, órgãos emissores e datas de validade específicos serão publicados nesta
          página assim que fornecidos pelo cliente — o Motor de Conformidade (fase futura) vai gerenciar
          essas credenciais de forma estruturada por tenant.
        </p>
      </div>
    </section>
  );
}
