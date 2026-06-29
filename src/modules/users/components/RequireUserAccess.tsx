"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useUserAccess } from "../hooks/useUserAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireUserAccess({
  children,
  requireManage = false,
}: Props) {
  const { canManageUsers } = useUserAccess();

  if (!canManageUsers) {
    return (
      <ErrorState
        title="Accès refusé"
        message={
          requireManage
            ? "Vous n'avez pas la permission manage:users pour gérer les utilisateurs."
            : "Vous n'avez pas la permission manage:users pour accéder à cette section."
        }
      />
    );
  }

  return <>{children}</>;
}
