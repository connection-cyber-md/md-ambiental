"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  "adidas.png", "aple.png", "chanel.png", "harley.png", 
  "658 ikea.png", "lego.png", "nfl.png", "porsche.png", 
  "starbucks.png", "uniqlo.png"
];

export function LogoMarquee() {
  return (
    <div className="w-full bg-black border-t border-b border-brand-amber/25 overflow-hidden py-8">
      <div className="max-w-[1440px] mx-auto mb-4 px-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-amber/60 font-mono">
          Empresas que confiam em nosso processo
        </p>
      </div>
      
      <motion.div
        className="flex gap-20 items-center"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex-shrink-0">
            <Image
                src={`/logoclientes/${logo}`}
                alt="Logo cliente"
                width={80}
                height={40}
              className="object-contain opacity-100 transition-opacity duration-300 hover:opacity-100"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}