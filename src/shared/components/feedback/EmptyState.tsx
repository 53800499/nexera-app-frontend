"use client";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
      role="status"
    >
      {icon ?? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
          📭
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
