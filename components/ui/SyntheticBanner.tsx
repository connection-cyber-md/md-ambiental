export function SyntheticBanner({ total }: { total: number }) {
  if (total <= 0) return null;

  return (
    <div className="bg-brand-amber/15 border-b border-brand-amber/40 print:hidden">
      <div className="max-w-[1180px] mx-auto px-6 py-2 text-[12.5px] text-brand-amber-deep flex items-center gap-2">
        <span aria-hidden="true">⚠</span>
        <span>
          Este ambiente contém dados sintéticos de demonstração ({total} registro{total > 1 ? "s" : ""}). Não
          representam operações reais.
        </span>
      </div>
    </div>
  );
}
