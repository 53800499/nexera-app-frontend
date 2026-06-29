"use client";

import { OrdersSyncStatusBadge } from "./OrdersSyncStatusBadge";
import { useOrdersSync } from "../hooks/useOrdersSync";

export function OrdersOfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useOrdersSync();
  return <>{children}</>;
}

export { OrdersSyncStatusBadge };
