"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "brand" | "teal" | "ghost";
  size?: "md" | "lg";
}

export function PrimaryButton({
  children,
  loading,
  variant = "brand",
  size = "lg",
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-[var(--radius-btn)] transition-all duration-150 active:scale-[0.97] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base w-full",
  };

  const variants = {
    brand:
      "bg-brand text-white hover:bg-brand-dark shadow-[0_4px_14px_rgb(0_119_182/0.5)] hover:shadow-[0_4px_20px_rgb(0_119_182/0.7)]",
    teal: "bg-teal text-[#0F0A1E] hover:opacity-90",
    ghost: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
