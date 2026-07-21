"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { useQueryPageState } from "@/shared/hooks/useQueryPageState";
import { EmailTemplateForm } from "../components/EmailTemplateForm";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useEmailTemplate } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { EmailTemplateFormValues } from "../schemas/settingsForm.schema";
import type { EmailTemplateType } from "../types/settings.types";
import { EMAIL_TEMPLATE_LABELS } from "../utils/settingsLabels";

type Props = {
  type: EmailTemplateType;
};

export default function EmailTemplateEditPage({ type }: Props) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { templateQuery, updateMutation } = useEmailTemplate(type);
  const { showLoading, showError } = useQueryPageState(templateQuery);
  const templateLabel = EMAIL_TEMPLATE_LABELS[type];

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer ce modèle email ?",
        message: `Le modèle « ${templateLabel} » sera mis à jour${values.isActive ? " et restera actif" : " et sera désactivé"}.`,
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement du modèle...",
      success: {
        title: "Modèle enregistré",
        message: templateLabel,
      },
      error: {
        title: "Enregistrement impossible",
        message:
          "Vérifiez l'objet, le corps du message et l'état actif/inactif du modèle.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => updateMutation.mutateAsync(values),
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/parametres/modeles-email"
        className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Retour aux modèles email
      </Link>

      <SettingsPageHeader
        title={templateLabel}
        description="Personnalisez l'objet et le corps de cet email automatique."
      />

      {showLoading ? (
        <LoadingBlock label="Chargement du modèle..." />
      ) : null}

      {showError ? (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger ce modèle email."
          onRetry={() => templateQuery.refetch()}
        />
      ) : null}

      {templateQuery.data ? (
        <SettingsContentCard>
          <EmailTemplateForm
            template={templateQuery.data}
            readOnly={!canManageSettings}
            isSubmitting={updateMutation.isPending || isBusy}
            onSubmit={handleSubmit}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
