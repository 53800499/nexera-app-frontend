"use client";

import { usePathname } from "next/navigation";
import { RequireSettingsAccess } from "./RequireSettingsAccess";
import { SettingsNav } from "./SettingsNav";
import { useSettingsAccess } from "../hooks/useSettingsAccess";

type Props = {
  children: React.ReactNode;
};

export function SettingsShell({ children }: Props) {
  const pathname = usePathname();
  const { canManageSettings } = useSettingsAccess();
  const isSubPage = pathname !== "/parametres";

  return (
    <RequireSettingsAccess>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="w-full lg:w-64 lg:shrink-0">
          <SettingsNav />
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {isSubPage && !canManageSettings ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Mode lecture seule — vous pouvez consulter ces paramètres mais pas
              les modifier.
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </RequireSettingsAccess>
  );
}
