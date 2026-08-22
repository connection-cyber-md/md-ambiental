"use client";

import React, { useEffect } from "react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll nativo otimizado de alta performance para Next.js 15
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return <>{children}</>;
}

export default SmoothScrollProvider;