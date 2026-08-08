"use client";

import React from "react";
import { RefreshCw, Database, Factory, Flame } from "lucide-react";

interface ImpactCardProps {
  icon: React.ReactNode;
  value: string;
  description: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ icon, value, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
    <div className="w-12 h-12 mb-4 flex items-center justify-center text-blue-600">
      {icon}
    </div>
    <span className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2 tracking-tight">
      {value}
    </span>
    <p className="text-gray-600 text-xs lg:text-sm font-medium leading-relaxed">
      {description}
    </p>
  </div>
);

export function EnvironmentalImpact() {
  return (
    <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-emerald-900/90 to-slate-900/90 text-white overflow-hidden">
      {/* Container Principal */}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        {/* Cabeçalho da Seção */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Nossa atuação está diretamente conectada com a Sustentabilidade
        </h2>
        <p className="text-gray-200 text-sm md:text-base mb-12 font-light">
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
        <div className="mt-12 text-xs text-gray-300 tracking-wider">
          Acumulado desde 2016 – Fonte ANP *TonCo2eq
        </div>
      </div>
    </section>
  );
}