"use client";

import {
  cabinetScopePermissionLabel,
  type CabinetScopePermissionCode,
} from "../constants/cabinetPermissionLabels";

type Props = {
  permissions: string[];
  compact?: boolean;
};

export function CabinetPermissionBadges({ permissions, compact = false }: Props) {
  if (permissions.length === 0) {
    return (
      <span className="text-sm text-gray-500">Aucun droit accordé</span>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "gap-2"}`}>
      {permissions.map((permission) => (
        <span
          key={permission}
          className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
        >
          {cabinetScopePermissionLabel(permission as CabinetScopePermissionCode)}
        </span>
      ))}
    </div>
  );
}
