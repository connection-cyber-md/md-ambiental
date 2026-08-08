"use client";

import React from "react";
import { RefreshCw, Database, Factory, Flame } from "lucide-react";

interface ImpactCardProps {
  icon: React.ReactNode;
  value: string;
  line3: string;
  line4: string;
  borderColor: string;
}

const SquareImpactCard: React.FC<ImpactCardProps> = ({ icon, value, line3, line4, borderColor }) => (
  <div className={`bg-transparent backdrop-blur-sm rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-[1.5px] ${borderColor} text-white w-full h-[110px] shadow-lg transition-transform hover:scale-105 duration-300`}>
    <div className="mb-1 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-[13px] font-normal tracking-tight text-white mb-0.5">
      {value}
    </span>
    <span className="text-slate-200 text-[9.5px] font-normal leading-tight">
      {line3}
    </span>
    <span className="text-slate-300 text-[9.5px] font-normal leading-tight">
      {line4}
    </span>
  </div>
);

export function EnvironmentalImpact() {
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      <SquareImpactCard
        icon={<RefreshCw className="w-4 h-4 text-emerald-400" />}
        value="142.500"
        line3="Barris"
        line4="Rerrefinados"
        borderColor="border-emerald-400"
      />
      <SquareImpactCard
        icon={<Database className="w-4 h-4 text-rose-400" />}
        value="4.820.100"
        line3="Barris"
        line4="não Extraídos"
        borderColor="border-rose-400"
      />
      <SquareImpactCard
        icon={<Factory className="w-4 h-4 text-amber-400" />}
        value="24.350"
        line3="Refino"
        line4="Emissões Evitadas"
        borderColor="border-amber-400"
      />
      <SquareImpactCard
        icon={<Flame className="w-4 h-4 text-orange-400" />}
        value="152.800"
        line3="Queima Ilegal"
        line4="Emissões Evitadas"
        borderColor="border-orange-400"
      />
    </div>
  );
}