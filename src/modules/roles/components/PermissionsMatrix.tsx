"use client";

import { useMemo } from "react";
import { Spinner } from "@/shared/components/feedback";
import type { Permission, Role } from "../types/role.types";
import {
  getPermissionGroup,
  getRolePermissionIds,
} from "../utils/permissionGroups";

type Props = {
  roles: Role[];
  permissions: Permission[];
  isUpdating: boolean;
  updatingCell?: { roleId: string; permissionId: string } | null;
  onToggle: (roleId: string, permissionId: string, enabled: boolean) => void;
};

export function PermissionsMatrix({
  roles,
  permissions,
  isUpdating,
  updatingCell,
  onToggle,
}: Props) {
  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.code.localeCompare(b.code)),
    [permissions],
  );

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of sortedPermissions) {
      const group = getPermissionGroup(permission.code);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(permission);
    }
    return groups;
  }, [sortedPermissions]);

  const rolePermissionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const role of roles) {
      map.set(role.id, getRolePermissionIds(role));
    }
    return map;
  }, [roles]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
              <th className="sticky left-0 z-20 min-w-[180px] border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                Rôle
              </th>
              {Array.from(permissionGroups.entries()).map(([group, items]) => (
                <th
                  key={group}
                  colSpan={items.length}
                  className="border-l border-gray-200 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-600 dark:border-gray-800 dark:text-brand-400"
                >
                  {group}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40">
              <th className="sticky left-0 z-20 border-r border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/40" />
              {sortedPermissions.map((permission) => (
                <th
                  key={permission.id}
                  title={permission.description ?? permission.code}
                  className="min-w-[88px] border-l border-gray-100 px-2 py-2 text-center text-[10px] font-medium text-gray-600 dark:border-gray-800 dark:text-gray-400"
                >
                  <span className="block rotate-0 whitespace-nowrap">
                    {permission.code.replace(/^manage:/, "").replace(/\.read$/, ".r").replace(/\.write$/, ".w")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-gray-100 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-white/[0.02]"
              >
                <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {role.name}
                  </p>
                  <p className="text-xs text-gray-500">{role.code}</p>
                </td>
                {sortedPermissions.map((permission) => {
                  const enabled =
                    rolePermissionMap.get(role.id)?.has(permission.id) ?? false;
                  const isCellUpdating =
                    isUpdating &&
                    updatingCell?.roleId === role.id &&
                    updatingCell?.permissionId === permission.id;

                  return (
                    <td
                      key={`${role.id}-${permission.id}`}
                      className="border-l border-gray-100 px-2 py-3 text-center dark:border-gray-800"
                    >
                      {isCellUpdating ? (
                        <Spinner size="sm" className="mx-auto" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={enabled}
                          disabled={isUpdating}
                          aria-label={`${role.name} - ${permission.code}`}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                          onChange={(event) =>
                            onToggle(
                              role.id,
                              permission.id,
                              event.target.checked,
                            )
                          }
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
