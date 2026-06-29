"use client";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white" | "accent";
  className?: string;
  label?: string;
};

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-9 w-9",
  lg: "h-12 w-12",
} as const;

const variantMap = {
  primary: "text-[var(--color-nexera-primary)]",
  white: "text-white",
  accent: "text-[var(--color-nexera-accent)]",
} as const;

export function Spinner({
  size = "md",
  variant = "primary",
  className,
  label = "Chargement en cours",
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={label}
      className={cn("animate-spin", sizeMap[size], variantMap[variant], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
