"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useCrmAccess } from "../hooks/useCrmAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireCrmAccess({ children, requireManage = false }: Props) {
  const { canReadClients, canManageClients } = useCrmAccess();

  if (requireManage && !canManageClients) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:clients pour cette action."
      />
    );
  }

  if (!canReadClients && !canManageClients) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission clients.read pour accéder au CRM."
      />
    );
  }

  return <>{children}</>;
}
