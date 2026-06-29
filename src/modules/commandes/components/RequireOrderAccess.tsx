"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useOrderAccess } from "../hooks/useOrderAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireOrderAccess({ children, requireManage = false }: Props) {
  const { canReadOrders, canManageOrders } = useOrderAccess();

  if (requireManage && !canManageOrders) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:orders pour cette action."
      />
    );
  }

  if (!canReadOrders && !canManageOrders) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission orders.read pour accéder aux commandes."
      />
    );
  }

  return <>{children}</>;
}
