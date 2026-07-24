export const ALERT_TYPE_LABELS: Record<string, string> = {
  shortage: "Rupture",
  safety: "Alerte sécurité",
  overstock: "Surstock",
  expiry: "Péremption",
  dormant: "Dormant",
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  open: "Ouverte",
  acknowledged: "Acquittée",
  resolved: "Résolue",
  dismissed: "Ignorée",
};

export const REPLENISHMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
  cancelled: "Annulée",
};

export function alertBadgeClass(severity: string, alertType?: string) {
  if (alertType === "shortage" || severity === "critical") {
    return "bg-red-50 text-red-700";
  }
  if (alertType === "safety" || alertType === "expiry" || severity === "warning") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-gray-100 text-gray-700";
}
