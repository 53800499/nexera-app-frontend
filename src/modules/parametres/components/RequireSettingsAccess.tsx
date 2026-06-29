"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useSettingsAccess } from "../hooks/useSettingsAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireSettingsAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadSettings, canManageSettings } = useSettingsAccess();

  if (requireManage && !canManageSettings) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission de modifier les paramètres."
      />
    );
  }

  if (!canReadSettings && !canManageSettings) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission settings.read pour accéder aux paramètres."
      />
    );
  }

  return <>{children}</>;
}
