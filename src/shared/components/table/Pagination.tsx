"use client";

import React from "react";

type PaginationLabels = {
  previous?: string;
  next?: string;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  labels?: PaginationLabels;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number,
): number[] {
  if (totalPages <= 0) return [];
  const half = Math.floor(maxVisiblePages / 2);
  const start = clamp(currentPage - half, 1, Math.max(totalPages - maxVisiblePages + 1, 1));
  const end = Math.min(start + maxVisiblePages - 1, totalPages);
  const result: number[] = [];
  for (let page = start; page <= end; page += 1) {
    result.push(page);
  }
  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  labels = { previous: "Précédent", next: "Suivant" },
  className = "",
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        {labels.previous ?? "Précédent"}
      </button>

      <div className="flex items-center gap-2">
        {pages[0] > 1 && <span className="px-2 text-sm text-gray-500">...</span>}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${
              currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
            }`}
          >
            {page}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <span className="px-2 text-sm text-gray-500">...</span>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        {labels.next ?? "Suivant"}
      </button>
    </div>
  );
}
