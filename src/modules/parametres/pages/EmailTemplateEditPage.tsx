"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { EmailTemplateForm } from "../components/EmailTemplateForm";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useEmailTemplate } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { EmailTemplateType } from "../types/settings.types";
import { EMAIL_TEMPLATE_LABELS } from "../utils/settingsLabels";

type Props = {
  type: EmailTemplateType;
};

export default function EmailTemplateEditPage({ type }: Props) {
  const { canManageSettings } = useSettingsAccess();
  const { templateQuery, updateMutation } = useEmailTemplate(type);

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
        title={EMAIL_TEMPLATE_LABELS[type]}
        description="Personnalisez l'objet et le corps de cet email automatique."
      />

      {templateQuery.isPending && !templateQuery.data && (
        <LoadingBlock label="Chargement du modèle..." />
      )}

      {templateQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger ce modèle email."
          onRetry={() => templateQuery.refetch()}
        />
      )}

      {templateQuery.data ? (
        <SettingsContentCard>
          <EmailTemplateForm
            template={templateQuery.data}
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
