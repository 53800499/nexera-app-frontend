import type { Permission, RolePermissionLink } from "../types/role.types";

export function getPermissionGroup(code: string): string {
  if (code.includes(":")) return code.split(":")[0];
  if (code.includes(".")) return code.split(".")[0];
  return "autres";
}

export function groupPermissions(
  permissions: Permission[],
): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {};

  for (const permission of permissions) {
    const group = getPermissionGroup(permission.code);
    if (!groups[group]) groups[group] = [];
    groups[group].push(permission);
  }

  for (const group of Object.keys(groups)) {
    groups[group].sort((a, b) => a.code.localeCompare(b.code));
  }

  return groups;
}

export function getRolePermissionIds(role: {
  permissions: RolePermissionLink[];
}): Set<string> {
  return new Set(role.permissions.map((link) => link.permissionId));
}
