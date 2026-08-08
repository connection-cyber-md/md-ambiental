export function KpiCard({
  label,
  value,
  hint,
  accent,
  borderClassName,
  labelClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  borderClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`bg-white border-[1.5px] rounded-lg ${borderClassName ?? "border-ink/10"} p-4`}>
      <div className={`text-[11px] mb-1 ${labelClassName ?? "text-black"}`}>{label}</div>
      <div className="font-display text-[20px] text-black">{value}</div>
      {hint && (
        <div className={`text-[11px] mt-0.5 ${accent ? "text-brand-amber" : "text-brand-green"}`}>{hint}</div>
      )}
    </div>
  );
}
