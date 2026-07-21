"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/icons";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { useQueryPageState } from "@/shared/hooks/useQueryPageState";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useEmailTemplates } from "../hooks/useSettings";
import { EMAIL_TEMPLATE_LABELS } from "../utils/settingsLabels";

export default function EmailTemplatesPage() {
  const templatesQuery = useEmailTemplates();
  const { showLoading, showError } = useQueryPageState(templatesQuery);

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Modèles email"
        description="Personnalisez les emails envoyés automatiquement à vos clients."
      />

      {showLoading ? (
        <LoadingBlock label="Chargement des modèles..." />
      ) : null}

      {showError ? (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les modèles email."
          onRetry={() => templatesQuery.refetch()}
        />
      ) : null}

      {templatesQuery.data ? (
        <div className="space-y-3">
          {templatesQuery.data.map((template) => (
            <Link
              key={template.type}
              href={`/parametres/modeles-email/${template.type}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {EMAIL_TEMPLATE_LABELS[template.type]}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {template.subject || "Aucun objet défini"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    template.isActive
                      ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {template.isActive ? "Actif" : "Inactif"}
                </span>
                <ArrowRightIcon className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
