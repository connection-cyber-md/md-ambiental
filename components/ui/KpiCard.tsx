export function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white border border-ink/10 p-4">
      <div className="text-[11px] text-steel mb-1">{label}</div>
      <div className="font-display text-[22px] text-ink">{value}</div>
      {hint && (
        <div className={`text-[11px] mt-0.5 ${accent ? "text-brand-amber" : "text-brand-green"}`}>{hint}</div>
      )}
    </div>
  );
}
