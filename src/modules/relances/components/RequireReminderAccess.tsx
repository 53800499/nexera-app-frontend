"use client";

import { ErrorState } from "@/shared/components/feedback";
import { useReminderAccess } from "../hooks/useReminderAccess";

type Props = {
  children: React.ReactNode;
  requireManage?: boolean;
};

export function RequireReminderAccess({
  children,
  requireManage = false,
}: Props) {
  const { canReadReminders, canManageReminders } = useReminderAccess();

  if (requireManage && !canManageReminders) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission manage:reminders pour cette action."
      />
    );
  }

  if (!canReadReminders && !canManageReminders) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'avez pas la permission reminders.read pour accéder aux relances."
      />
    );
  }

  return <>{children}</>;
}
