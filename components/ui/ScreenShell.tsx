import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function ScreenShell({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn(
        "min-h-screen flex flex-col bg-bg-dark text-text-primary px-5 pb-8 pt-safe",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}
