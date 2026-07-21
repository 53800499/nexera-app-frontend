"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { SettingsReminderForm } from "../components/SettingsReminderForm";
import { useSettingsReminders } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { ReminderSettingsFormValues } from "../schemas/settingsForm.schema";

export default function ReminderSettingsPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { settingsQuery, updateMutation } = useSettingsReminders();

  const handleSubmit = async (values: ReminderSettingsFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer les paramètres de relance ?",
        message: values.isEnabled
          ? "Les relances automatiques seront activées avec les délais et options définis."
          : "Les relances automatiques seront désactivées jusqu'à réactivation.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement des relances...",
      success: {
        title: "Paramètres enregistrés",
        message: values.isEnabled
          ? "Relances automatiques activées"
          : "Relances automatiques désactivées",
      },
      error: {
        title: "Enregistrement impossible",
        message:
          "Vérifiez les délais (J+), les adresses e-mail et les options de relance.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        updateMutation.mutateAsync({
          ...values,
          commercialEmail: values.commercialEmail || undefined,
          directorEmail: values.directorEmail || undefined,
        }),
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
            isSubmitting={updateMutation.isPending || isBusy}
            onSubmit={handleSubmit}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
