import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full border border-ink/20 bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-steel-light",
        "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green",
        className
      )}
      {...props}
    />
  );
}
