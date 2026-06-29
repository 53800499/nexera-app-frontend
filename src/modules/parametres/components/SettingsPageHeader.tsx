"use client";

import { useSettingsAccess } from "../hooks/useSettingsAccess";

type Props = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function SettingsPageHeader({ title, description, actions }: Props) {
  const { canManageSettings } = useSettingsAccess();

  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-white/90">
            {title}
          </h1>
          {canManageSettings ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              Modification
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Lecture seule
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm text-gray-500">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
