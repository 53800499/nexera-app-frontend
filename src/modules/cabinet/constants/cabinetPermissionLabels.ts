export const CABINET_SCOPE_PERMISSIONS = {
  INVOICES_READ: "cabinet.scope.invoices.read",
  PAYMENTS_READ: "cabinet.scope.payments.read",
  CLIENTS_READ: "cabinet.scope.clients.read",
} as const;

export type CabinetScopePermissionCode =
  (typeof CABINET_SCOPE_PERMISSIONS)[keyof typeof CABINET_SCOPE_PERMISSIONS];

export const CABINET_SCOPE_PERMISSION_OPTIONS: {
  code: CabinetScopePermissionCode;
  label: string;
  description: string;
  available: boolean;
}[] = [
  {
    code: CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
    label: "Consulter les factures",
    description: "Lecture des factures émises par l'entreprise.",
    available: true,
  },
  {
    code: CABINET_SCOPE_PERMISSIONS.PAYMENTS_READ,
    label: "Consulter les encaissements",
    description: "Suivi des paiements reçus (bientôt disponible).",
    available: false,
  },
  {
    code: CABINET_SCOPE_PERMISSIONS.CLIENTS_READ,
    label: "Consulter les clients",
    description: "Référentiel clients de l'entreprise (bientôt disponible).",
    available: false,
  },
];

export const DEFAULT_CABINET_SCOPE_PERMISSIONS: CabinetScopePermissionCode[] = [
  CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
];

export function cabinetScopePermissionLabel(code: string): string {
  const option = CABINET_SCOPE_PERMISSION_OPTIONS.find((item) => item.code === code);
  return option?.label ?? code;
}

export function hasCabinetScopePermission(
  permissions: string[] | undefined,
  code: CabinetScopePermissionCode,
): boolean {
  return permissions?.includes(code) ?? false;
}
