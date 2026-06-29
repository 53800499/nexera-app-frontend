"use client";

import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { SettingsReminderForm } from "../components/SettingsReminderForm";
import { useSettingsReminders } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { ReminderSettingsFormValues } from "../schemas/settingsForm.schema";

export default function ReminderSettingsPage() {
  const { canManageSettings } = useSettingsAccess();
  const { settingsQuery, updateMutation } = useSettingsReminders();

  const handleSubmit = async (values: ReminderSettingsFormValues) => {
    await updateMutation.mutateAsync({
      ...values,
      commercialEmail: values.commercialEmail || undefined,
      directorEmail: values.directorEmail || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Relances"
        description="Seuils, délais et activation des relances automatiques."
      />

      {settingsQuery.isPending && !settingsQuery.data && (
        <LoadingBlock label="Chargement des paramètres..." />
      )}

      {settingsQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les paramètres de relance."
          onRetry={() => settingsQuery.refetch()}
        />
      )}

      {settingsQuery.data ? (
        <SettingsContentCard>
          <SettingsReminderForm
            settings={settingsQuery.data}
            readOnly={!canManageSettings}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSubmit}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
