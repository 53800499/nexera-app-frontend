export type ValuationMethod = "cmup" | "fifo" | "lifo";

export type ValuationLine = {
  stockItemId: string;
  reference: string;
  name: string;
  unit: string;
  valuationMethod: ValuationMethod;
  warehouseId: string | null;
  warehouseCode: string | null;
  warehouseName: string | null;
  lotId: string | null;
  lotNumber: string | null;
  qty: number;
  unitCost: number;
  totalValue: number;
};

export type ValuationReport = {
  asOf: string;
  warehouseId: string | null;
  lines: ValuationLine[];
  totals: {
    totalQty: number;
    totalValue: number;
    lineCount: number;
    byMethod: Record<
      string,
      { qty: number; value: number; count: number }
    >;
  };
};

export type CmupHistoryEntry = {
  id: string;
  qtyBefore: number;
  qtyAfter: number;
  cmupBefore: number;
  cmupAfter: number;
  entryQty: number;
  entryUnitCost: number;
  recordedAt: string;
  movementId: string | null;
};

export type CmupHistoryResponse = {
  stockItemId: string;
  reference: string;
  name: string;
  valuationMethod: ValuationMethod;
  currentCmup: number;
  history: CmupHistoryEntry[];
};

/** §3.3 — taux de rotation */
export type TurnoverReport = {
  from: string;
  to: string;
  warehouseId: string | null;
  cogs: number;
  qtySold: number;
  openingValue: number;
  closingValue: number;
  averageStockValue: number;
  turnoverRate: number | null;
  formula: string;
};
