"use client";

import React from "react";
import { RefreshCw, Database, Factory, Flame } from "lucide-react";

interface ImpactCardProps {
  icon: React.ReactNode;
  value: string;
  description: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ icon, value, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300 border border-slate-100">
    <div className="w-12 h-12 mb-4 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-2xl lg:text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">
      {value}
    </span>
    <p className="text-slate-700 text-xs lg:text-sm font-semibold leading-relaxed">
      {description}
    </p>
  </div>
);

export function EnvironmentalImpact() {
  return (
    <section className="relative py-20 px-4 md:px-8 bg-slate-900 text-white overflow-hidden shadow-inner">
      {/* Container Principal */}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        {/* Cabeçalho da Seção */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">
          Nossa atuação está diretamente conectada com a Sustentabilidade
        </h2>
        <p className="text-slate-300 text-sm md:text-base mb-12 font-medium">
          Confira os impactos de nossa operação no meio ambiente:
        </p>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactCard
            icon={<RefreshCw className="w-10 h-10 text-emerald-600" />}
            value="9.671.466"
            description="Barris de óleo rerrefinados"
          />
          <ImpactCard
            icon={<Database className="w-10 h-10 text-rose-500" />}
            value="322.352.911"
            description="Barris de petróleo deixaram de ser extraídos"
          />
          <ImpactCard
            icon={<Factory className="w-10 h-10 text-amber-500" />}
            value="1.684.069"
            description="Emissões evitadas em relação ao 1º refino nacional"
          />
          <ImpactCard
            icon={<Flame className="w-10 h-10 text-orange-500" />}
            value="10.578.547"
            description="Emissões evitadas em relação a queima ilegal"
          />
        </div>

        {/* Rodapé explicativo */}
        <div className="mt-12 text-xs text-slate-400 tracking-wider">
          Acumulado desde 2016 – Fonte ANP *TonCo2eq
        </div>
      </div>
    </section>
  );
}