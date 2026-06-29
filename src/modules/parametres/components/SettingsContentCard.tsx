import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
};

export function SettingsContentCard({
  children,
  className = "",
  noPadding = false,
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className={noPadding ? "" : "p-5 lg:p-6"}>{children}</div>
    </div>
  );
}
