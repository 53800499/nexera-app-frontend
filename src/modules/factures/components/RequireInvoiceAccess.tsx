"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useInvoiceAccess } from "../hooks/useInvoiceAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireInvoiceAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadInvoices, canManageInvoices } = useInvoiceAccess();

  if (requireManage && !canManageInvoices) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:invoices pour cette action."
      />
    );
  }

  if (!canReadInvoices && !canManageInvoices) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission invoices.read pour accéder aux factures."
      />
    );
  }

  return <>{children}</>;
}
