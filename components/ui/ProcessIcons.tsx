import { CalendarClock, Truck, FlaskConical, Filter, Waypoints } from "lucide-react";

// Ícones das 5 etapas do processo (ComoFuncionaSection).
// Refatorado para utilizar lucide-react com design sistêmico e tecnológico.
// Os nomes das exportações foram mantidos idênticos para não quebrar o layout pai.

export function CalendarIcon({ className }: { className?: string }) {
  return <CalendarClock className={className} strokeWidth={1.7} aria-hidden="true" />;
}

export function CollectionTruckIcon({ className }: { className?: string }) {
  return <Truck className={className} strokeWidth={1.7} aria-hidden="true" />;
}

export function AnalysisIcon({ className }: { className?: string }) {
  return <FlaskConical className={className} strokeWidth={1.7} aria-hidden="true" />;
}

export function SeparationIcon({ className }: { className?: string }) {
  return <Filter className={className} strokeWidth={1.7} aria-hidden="true" />;
}

export function DistributionIcon({ className }: { className?: string }) {
  return <Waypoints className={className} strokeWidth={1.7} aria-hidden="true" />;
}