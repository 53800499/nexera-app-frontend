"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/icons";
import type { BreadcrumbItem } from "./types";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function AppBreadcrumbs({ items, className = "" }: Props) {
  if (items.length <= 1) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex min-w-0 items-center gap-1 text-sm ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate ${
                  isLast
                    ? "font-medium text-gray-800 dark:text-white/90"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
