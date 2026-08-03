import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-[11.5px] tracking-[0.06em] uppercase text-steel",
        className
      )}
      {...props}
    />
  );
}
