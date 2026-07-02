"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogItemForm } from "../components/CatalogItemForm";
import { buildCreateItemPayload } from "../utils/catalogMappers";
import {
  useCatalogCategories,
  useCatalogueItems,
  useTaxRates,
} from "../hooks/useCatalogue";
import { useCatalogAccess } from "../hooks/useCatalogAccess";

export default function CreateCatalogItemPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canReadTaxRates } = useCatalogAccess();
  const { createItemMutation } = useCatalogueItems();
  const { categoriesQuery } = useCatalogCategories();
  const taxRatesQuery = useTaxRates();

  const isPageLoading = categoriesQuery.isLoading || taxRatesQuery.isLoading;

  return (
    <RequireCatalogAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/catalogue"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au catalogue
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvel article / service
          </h1>
          <p className="text-sm text-gray-500">
            Création d&apos;un élément du catalogue (UC-02). La référence
            ART-XXXXXX sera générée automatiquement.
          </p>
        </div>

        {isPageLoading && <LoadingBlock label="Chargement des données..." />}

        {!canReadTaxRates && !taxRatesQuery.isLoading ? (
          <ErrorState
            title="Taux de TVA indisponibles"
            message="La permission settings.read est requise pour charger les taux de TVA."
          />
        ) : null}

        {taxRatesQuery.isError ? (
          <ErrorState
            title="Taux de TVA indisponibles"
            message="Impossible de charger les taux de TVA."
            onRetry={() => taxRatesQuery.refetch()}
          />
        ) : null}

        {categoriesQuery.data && taxRatesQuery.data ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <CatalogItemForm
              categories={categoriesQuery.data}
              taxRates={taxRatesQuery.data}
              isSubmitting={isBusy}
              submitLabel="Créer l'article"
              onSubmit={async (values) => {
                await runAction({
                  confirm: {
                    title: "Créer cet article ?",
                    message: `Confirmer la création de « ${values.name} » dans le catalogue.`,
                    confirmLabel: "Créer",
                  },
                  loadingMessage: "Création de l'article...",
                  success: {
                    title: "Article créé",
                    message: values.name,
                  },
                  error: {
                    title: "Création impossible",
                    message:
                      "Vérifiez les champs obligatoires et réessayez.",
                  },
                  redirectTo: (created) => `/catalogue/${created.id}`,
                  redirectMessage: "Ouverture de la fiche article...",
                  action: () =>
                    createItemMutation.mutateAsync(
                      buildCreateItemPayload(values),
                    ),
                });
              }}
            />
          </div>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
