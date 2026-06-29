"use client";

import type { SelectHTMLAttributes } from "react";
import { CURRENCY_OPTIONS } from "@/shared/constants/currencies";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  hint?: string;
};

const baseClassName =
  "h-11 w-full rounded-lg border bg-white px-4 text-sm dark:bg-gray-900";

export function CurrencySelect({
  error = false,
  hint,
  className = "",
  ...props
}: Props) {
  return (
    <div>
      <select
        {...props}
        className={`${baseClassName} ${
          error
            ? "border-error-500 focus:border-error-500"
            : "border-gray-300 dark:border-gray-700"
        } ${className}`}
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
