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
  <div className={`bg-transparent backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center justify-center text-center border-[1.5px] ${borderColor} text-white w-36 h-36 shadow-lg transition-transform hover:scale-105 duration-300`}>
    <div className="mb-1.5 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm font-extrabold tracking-tight text-white mb-0.5">
      {value}
    </span>
    <span className="text-slate-200 text-[10px] font-semibold leading-tight">
      {line3}
    </span>
    <span className="text-slate-300 text-[10px] font-medium leading-tight">
      {line4}
    </span>
  </div>
);

export function EnvironmentalImpact() {
  return (
    <div className="flex flex-col gap-3">
      <SquareImpactCard
        icon={<RefreshCw className="w-5 h-5 text-emerald-400" />}
        value="142.500"
        line3="Barris"
        line4="Rerrefinados"
        borderColor="border-emerald-400"
      />
      <SquareImpactCard
        icon={<Database className="w-5 h-5 text-rose-400" />}
        value="4.820.100"
        line3="Barris"
        line4="não Extraídos"
        borderColor="border-rose-400"
      />
      <SquareImpactCard
        icon={<Factory className="w-5 h-5 text-amber-400" />}
        value="24.350"
        line3="Refino"
        line4="Emissões Evitadas"
        borderColor="border-amber-400"
      />
      <SquareImpactCard
        icon={<Flame className="w-5 h-5 text-orange-400" />}
        value="152.800"
        line3="Queima Ilegal"
        line4="Emissões Evitadas"
        borderColor="border-orange-400"
      />
    </div>
  );
}