export type StockAlertType =
  | "shortage"
  | "safety"
  | "overstock"
  | "expiry"
  | "dormant";

export type StockAlertStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type ReplenishmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type StockAlert = {
  id: string;
  alertType: StockAlertType;
  status: StockAlertStatus;
  severity: "ok" | "warning" | "critical";
  stockItemId: string;
  warehouseId: string | null;
  lotId: string | null;
  qtyOnHand: number;
  thresholdQty: number | null;
  daysMetric: number | null;
  title: string;
  message: string;
  suggestion: string | null;
  suggestedQty: number | null;
  createdAt: string;
  stockItem?: {
    id: string;
    commercialItem?: { reference: string; name: string; unit?: string };
  };
  warehouse?: { id: string; code: string; name: string } | null;
  lot?: { id: string; lotNumber: string; expiryDate: string | null } | null;
  replenishment?: {
    id: string;
    number: string;
    status: ReplenishmentStatus;
    qtyProposed: number;
  } | null;
};

export type ReplenishmentProposal = {
  id: string;
  number: string;
  status: ReplenishmentStatus;
  stockItemId: string;
  warehouseId: string;
  alertId: string | null;
  qtyProposed: number;
  qtyConfigured: number | null;
  qtyAiSuggested: number | null;
  avgDailyUsage: number | null;
  daysToStockout: number | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  stockItem?: {
    commercialItem?: { reference: string; name: string; unit?: string };
  };
  warehouse?: { id: string; code: string; name: string };
  alert?: { id: string; alertType: string; title: string } | null;
};

export type AlertsSummary = {
  byType: Array<{
    alertType: StockAlertType;
    severity: string;
    _count: { _all: number };
  }>;
  openCount: number;
  pendingReplenishments: number;
};

export type ScanResult = {
  created: number;
  updated: number;
  resolved: number;
  proposalsCreated: number;
  active: number;
};
