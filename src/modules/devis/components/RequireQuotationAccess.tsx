"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useQuotationAccess } from "../hooks/useQuotationAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireQuotationAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadQuotations, canManageQuotations } = useQuotationAccess();

  if (requireManage && !canManageQuotations) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:quotations pour cette action."
      />
    );
  }

  if (!canReadQuotations && !canManageQuotations) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission quotations.read pour accéder aux devis."
      />
    );
  }

  return <>{children}</>;
}
