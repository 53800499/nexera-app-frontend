"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { PdfTemplateForm } from "../components/PdfTemplateForm";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { usePdfTemplate } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { PdfTemplateFormValues } from "../schemas/settingsForm.schema";

export default function PdfTemplatePage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { pdfQuery, updateMutation } = usePdfTemplate();

  const handleSubmit = async (values: PdfTemplateFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer le modèle PDF ?",
        message:
          "Les prochains documents générés utiliseront cette mise en page, ces couleurs et ces mentions.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement du modèle PDF...",
      success: {
        title: "Modèle PDF enregistré",
        message: "Vos documents refléteront ces changements.",
      },
      error: {
        title: "Enregistrement impossible",
        message:
          "Vérifiez l'URL du logo, les couleurs et les champs du modèle puis réessayez.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => updateMutation.mutateAsync(values),
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Modèle PDF"
        description="Logo, couleurs, mise en page et mentions légales de vos documents."
      />

      {pdfQuery.isPending && !pdfQuery.data && (
        <LoadingBlock label="Chargement du modèle PDF..." />
      )}

      {pdfQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger le modèle PDF."
          onRetry={() => pdfQuery.refetch()}
        />
      )}

      {pdfQuery.data ? (
        <SettingsContentCard>
          <PdfTemplateForm
            template={pdfQuery.data}
            readOnly={!canManageSettings}
            isSubmitting={updateMutation.isPending || isBusy}
            onSubmit={handleSubmit}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
