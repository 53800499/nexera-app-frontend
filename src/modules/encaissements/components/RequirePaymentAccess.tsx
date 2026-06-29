"use client";

import { ErrorState } from "@/shared/components/feedback";
import { usePaymentAccess } from "../hooks/usePaymentAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequirePaymentAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadPayments, canManagePayments } = usePaymentAccess();

  if (requireManage && !canManagePayments) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:payments pour cette action."
      />
    );
  }

  if (!canReadPayments && !canManagePayments) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission payments.read pour accéder aux encaissements."
      />
    );
  }

  return <>{children}</>;
}
