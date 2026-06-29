"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useAccessControl } from "../hooks/useAccessControl";

type Props = {
  permission: string;
  children: React.ReactNode;
};

export function RequirePermission({ permission, children }: Props) {
  const { hasBackendPermission } = useAccessControl();

  if (!hasBackendPermission(permission)) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission nécessaire pour accéder à cette section."
      />
    );
  }

  return <>{children}</>;
}
