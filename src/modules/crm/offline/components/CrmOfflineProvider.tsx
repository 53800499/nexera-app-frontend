"use client";

import { CrmSyncStatusBadge } from "./CrmSyncStatusBadge";
import { useCrmSync } from "../hooks/useCrmSync";

export function CrmOfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useCrmSync();
  return <>{children}</>;
}

export { CrmSyncStatusBadge };
