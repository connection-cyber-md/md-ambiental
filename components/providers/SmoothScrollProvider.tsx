"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {/* O 'as any' neutraliza o conflito de tipagem entre React 18 (Lenis) e React 19 (Next 15) */}
      {children as any}
    </ReactLenis>
  );
}