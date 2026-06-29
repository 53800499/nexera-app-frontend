"use client";

import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { PdfTemplateForm } from "../components/PdfTemplateForm";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { usePdfTemplate } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";

export default function PdfTemplatePage() {
  const { canManageSettings } = useSettingsAccess();
  const { pdfQuery, updateMutation } = usePdfTemplate();

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
            isSubmitting={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
