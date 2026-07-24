export type InventorySessionType = "total" | "partial";

export type InventorySessionStatus =
  | "draft"
  | "counting"
  | "recount"
  | "analyzing"
  | "validated"
  | "closed"
  | "cancelled";

export type InventoryCountLine = {
  id: string;
  stockItemId: string;
  lotId: string | null;
  locationId: string | null;
  qtyTheoretical?: number;
  qtyCounted1: number | null;
  qtyCounted2: number | null;
  qtyFinal: number | null;
  unitCost: number;
  varianceQty: number | null;
  varianceValue: number | null;
  requiresRecount: boolean;
  notes: string | null;
  stockItem?: {
    id: string;
    commercialItem?: {
      reference: string;
      name: string;
      unit?: string;
    };
  };
  lot?: { id: string; lotNumber: string } | null;
  location?: { id: string; code: string } | null;
};

export type InventorySession = {
  id: string;
  number: string;
  type: InventorySessionType;
  status: InventorySessionStatus;
  warehouseId: string;
  categoryId: string | null;
  plannedDate: string | null;
  freezeMovements: boolean;
  varianceThresholdQty: number;
  significantVarianceValue: number;
  startedAt: string | null;
  validatedAt: string | null;
  closedAt: string | null;
  notes: string | null;
  createdAt: string;
  warehouse?: { id: string; code: string; name: string };
  lines?: InventoryCountLine[];
  _count?: { lines: number };
};

export type CreateInventorySessionPayload = {
  type: InventorySessionType;
  warehouseId: string;
  categoryId?: string;
  plannedDate?: string;
  freezeMovements?: boolean;
  varianceThresholdQty?: number;
  significantVarianceValue?: number;
  notes?: string;
};

export type SubmitInventoryCountsPayload = {
  lines: Array<{
    lineId: string;
    qtyCounted: number;
    notes?: string;
  }>;
};

export type InventoryVariancesResponse = {
  session: {
    id: string;
    number: string;
    status: InventorySessionStatus;
    significantVarianceValue: number;
  };
  lines: Array<{
    id: string;
    reference: string;
    name: string;
    lotNumber: string | null;
    locationCode: string | null;
    qtyTheoretical: number;
    qtyCounted1: number | null;
    qtyCounted2: number | null;
    qtyFinal: number | null;
    unitCost: number;
    varianceQty: number | null;
    varianceValue: number | null;
    requiresRecount: boolean;
  }>;
};
