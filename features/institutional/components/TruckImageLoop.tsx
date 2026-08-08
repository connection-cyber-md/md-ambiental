"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Fotos com fundo removido, em C:\Projetos\md\cyber-mp-staging\public\caminhoes.
const TRUCK_IMAGES = [
  "/caminhoes/brancosf.png",
  "/caminhoes/cinzasf.png",
  "/caminhoes/pretosf.png",
  "/caminhoes/volvofrentesf.png",
  "/caminhoes/volvoladosf.png",
];

// Loop automático das fotos da frota, com crossfade — troca a cada 3s.
export function TruckImageLoop() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TRUCK_IMAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-[4/3] bg-white border border-ink/10 rounded-sm overflow-hidden">
      {TRUCK_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Caminhão da frota MD Ambiental"
          fill
          priority={i === 0}
          className={`object-contain p-6 transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
