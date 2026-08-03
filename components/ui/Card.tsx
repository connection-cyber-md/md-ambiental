import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-paper border border-ink/10 p-9 transition-all duration-250 hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
      {...props}
    />
  );
}
