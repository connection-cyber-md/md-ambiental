// Ícones das 5 etapas do processo (ComoFuncionaSection), um por situação
// em vez do RecycleIcon repetido. Mesmo padrão visual dos demais ícones
// de components/ui: viewBox 24x24, cor herdada de currentColor.

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CollectionTruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.3" y="9" width="11.5" height="7" rx="1" />
      <path d="M13.8 11h3.4l3 3.6v1.4h-6.4z" />
      <circle cx="6" cy="17.3" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17.3" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AnalysisIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="10.3" cy="10.3" r="6" />
      <line x1="14.8" y1="14.8" x2="20.5" y2="20.5" />
      <path d="M8 10.3h4.6" strokeWidth="1.4" />
    </svg>
  );
}

export function SeparationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.5 4.5h17L14 12.7v5.4l-4 2.2v-7.6L3.5 4.5z" />
    </svg>
  );
}

export function DistributionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 11.2 21 4l-7.2 18-2.5-7.6L3 11.2z" />
    </svg>
  );
}
