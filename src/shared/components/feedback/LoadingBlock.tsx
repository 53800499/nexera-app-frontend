"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type LoadingBlockProps = {
  label?: string;
  className?: string;
  minHeight?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingBlock({
  label = "Chargement en cours...",
  className,
  minHeight = "min-h-[220px]",
  size = "lg",
}: LoadingBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900",
        minHeight,
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size={size} />
      {label ? (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      ) : null}
    </div>
  );
}
