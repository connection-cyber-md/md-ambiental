import { transparencyContent } from "@/features/institutional/content/site-copy";

export function TransparenciaLicensesSection() {
  return (
    <section className="py-20 md:py-28 bg-paper-dim">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="max-w-[640px] mb-10">
          <p className="eyebrow">{transparencyContent.eyebrow}</p>
          <h2 className="font-display font-semibold text-[clamp(28px,3.6vw,44px)] leading-tight text-ink mb-4">
            {transparencyContent.title}
          </h2>
          <p className="text-[15.5px] text-steel">{transparencyContent.lead}</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {transparencyContent.items.map((item) => (
            <li
              key={item}
              className="bg-paper border border-ink/10 p-6 text-[15px] font-medium text-ink flex gap-3 items-start"
            >
              <span className="w-[7px] h-[7px] rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
