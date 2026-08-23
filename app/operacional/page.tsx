import Link from "next/link";

export const metadata = {
  title: "Área Operacional | MD Ambiental",
  description: "Central de logística, frota e rotas de campo da MD Ambiental.",
};

export default function OperacionalIndexPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Logística & Campo
          </span>
          <h1 className="font-display text-[28px] text-ink">Central Operacional</h1>
        </div>
        <Link
          href="/admin"
          className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
        >
          ← Voltar ao Painel Principal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/operacional/frota"
          className="bg-white p-6 rounded-lg border border-ink/10 hover:border-brand-green-deep transition-all shadow-xs group block"
        >
          <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Módulo Frota</span>
          <h3 className="font-display text-[20px] text-ink group-hover:text-brand-green-deep transition-colors mb-2">
            Gestão de Frota e Caminhões →
          </h3>
          <p className="text-[13px] text-steel">
            Controle de capacidade volumétrica, vistorias, manutenções e status de veículos.
          </p>
        </Link>

        <Link
          href="/operacional/rotas"
          className="bg-white p-6 rounded-lg border border-ink/10 hover:border-brand-green-deep transition-all shadow-xs group block"
        >
          <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Módulo Rotas</span>
          <h3 className="font-display text-[20px] text-ink group-hover:text-brand-green-deep transition-colors mb-2">
            Rotas & Escalas de Coleta →
          </h3>
          <p className="text-[13px] text-steel">
            Planejamento e monitoramento de rotas e turnos de coleta de OLUC em campo.
          </p>
        </Link>
      </div>
    </div>
  );
}