"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useStockAccess } from "../hooks/useStockAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireStockAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadStock, canManageStock } = useStockAccess();

  if (requireManage && !canManageStock) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:stock pour cette action."
      />
    );
  }

  if (!canReadStock && !canManageStock) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission stock.read pour accéder aux stocks."
      />
    );
  }

  return <>{children}</>;
}
