"use client";

import { StockSyncStatusBadge } from "./StockSyncStatusBadge";
import { useStockSync } from "../hooks/useStockSync";

export function StockOfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useStockSync();
  return <>{children}</>;
}

export { StockSyncStatusBadge };
