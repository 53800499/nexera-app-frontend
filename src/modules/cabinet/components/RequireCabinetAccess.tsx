"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useCabinetAccess } from "../hooks/useCabinetAccess";

type Props = {
  children: React.ReactNode;
};

export function RequireCabinetAccess({ children }: Props) {
  const { canReadCabinet } = useCabinetAccess();

  if (!canReadCabinet) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission cabinet.read pour accéder à l'espace cabinet."
      />
    );
  }

  return <>{children}</>;
}
