"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useDashboardAccess } from "../hooks/useDashboardAccess";

type Props = {
  children: React.ReactNode;
};

export function RequireDashboardAccess({ children }: Props) {
  const { canReadDashboard } = useDashboardAccess();

  if (!canReadDashboard) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission dashboard.read pour accéder au tableau de bord."
      />
    );
  }

  return <>{children}</>;
}
