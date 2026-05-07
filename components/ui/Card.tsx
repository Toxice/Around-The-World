import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
}

export function Card({ children, selected, interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] bg-bg-card border border-white/10 transition-all duration-150",
        interactive && "cursor-pointer hover:border-brand/60 hover:shadow-[var(--shadow-card)]",
        selected && "border-brand ring-2 ring-brand/40 shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
