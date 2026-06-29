"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useCatalogAccess } from "../hooks/useCatalogAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireCatalogAccess({ children, requireManage = false }: Props) {
  const { canReadCatalogue, canManageCatalogue } = useCatalogAccess();

  if (requireManage && !canManageCatalogue) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:catalogue pour cette action."
      />
    );
  }

  if (!canReadCatalogue && !canManageCatalogue) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission catalogue.read pour accéder au catalogue."
      />
    );
  }

  return <>{children}</>;
}
