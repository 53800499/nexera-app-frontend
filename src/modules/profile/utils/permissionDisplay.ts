import { getPermissionGroup } from "@/modules/roles/utils/permissionGroups";

const GROUP_LABELS: Record<string, string> = {
  settings: "Paramètres",
  manage: "Administration",
  users: "Utilisateurs",
  roles: "Rôles",
  clients: "Clients",
  catalogue: "Catalogue",
  devis: "Devis",
  factures: "Factures",
  commandes: "Commandes",
  encaissements: "Encaissements",
  relances: "Relances",
  autres: "Autres",
};

export function getPermissionGroupLabel(group: string): string {
  return GROUP_LABELS[group] ?? group;
}

export function groupProfilePermissionCodes(
  permissions: string[],
): Array<{ group: string; label: string; codes: string[] }> {
  const groups = new Map<string, string[]>();

  for (const code of [...permissions].sort((a, b) => a.localeCompare(b))) {
    const group = getPermissionGroup(code);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(code);
  }

  return Array.from(groups.entries()).map(([group, codes]) => ({
    group,
    label: getPermissionGroupLabel(group),
    codes,
  }));
}
