"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import type { Permission, Role } from "../types/role.types";
import {
  getRolePermissionIds,
  groupPermissions,
} from "../utils/permissionGroups";

type Props = {
  role: Role;
  permissions: Permission[];
  isSaving: boolean;
  onSave: (permissionIds: string[]) => Promise<void>;
};

export function RolePermissionsEditor({
  role,
  permissions,
  isSaving,
  onSave,
}: Props) {
  const initialIds = useMemo(
    () => Array.from(getRolePermissionIds(role)),
    [role],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  useEffect(() => {
    setSelectedIds(Array.from(getRolePermissionIds(role)));
  }, [role]);

  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  const togglePermission = (permissionId: string) => {
    setSelectedIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  };

  const selectGroup = (groupPermissionIds: string[], select: boolean) => {
    setSelectedIds((current) => {
      if (select) {
        return Array.from(new Set([...current, ...groupPermissionIds]));
      }
      return current.filter((id) => !groupPermissionIds.includes(id));
    });
  };

  const hasChanges =
    selectedIds.length !== initialIds.length ||
    selectedIds.some((id) => !initialIds.includes(id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Attribution des permissions
          </h2>
          <p className="text-sm text-gray-500">
            {selectedIds.length} permission(s) sélectionnée(s)
          </p>
        </div>
        <Button
          size="sm"
          disabled={!hasChanges || isSaving}
          onClick={() => onSave(selectedIds)}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les permissions"}
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([group, items]) => {
          const groupIds = items.map((item) => item.id);
          const allSelected = groupIds.every((id) => selectedIds.includes(id));

          return (
            <div
              key={group}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <Label className="mb-0 uppercase tracking-wide text-gray-500">
                  {group}
                </Label>
                <button
                  type="button"
                  onClick={() => selectGroup(groupIds, !allSelected)}
                  className="text-xs font-medium text-brand-500 hover:text-brand-600"
                >
                  {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {items.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedIds.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                    />
                    <span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {permission.code}
                      </span>
                      {permission.description ? (
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {permission.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
