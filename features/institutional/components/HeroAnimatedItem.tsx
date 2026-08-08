"use client";

// Adicionamos a importação do tipo 'Variants'
import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

// Tipamos a constante explicitamente como 'Variants'
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    },
  },
};

export default function HeroAnimatedItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}