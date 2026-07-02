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
import {
  buildUpdateItemPayload,
  itemToFormValues,
} from "../utils/catalogMappers";
import {
  useCatalogCategories,
  useCatalogItem,
  useCatalogueItems,
  useTaxRates,
} from "../hooks/useCatalogue";
import { useCatalogAccess } from "../hooks/useCatalogAccess";

export default function EditCatalogItemPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canReadTaxRates } = useCatalogAccess();
  const itemQuery = useCatalogItem(id);
  const { updateItemMutation } = useCatalogueItems();
  const { categoriesQuery } = useCatalogCategories();
  const taxRatesQuery = useTaxRates();

  const isPageLoading =
    itemQuery.isLoading ||
    categoriesQuery.isLoading ||
    taxRatesQuery.isLoading;

  return (
    <RequireCatalogAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/catalogue/${id}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la fiche
        </Link>

        {isPageLoading && <LoadingBlock label="Chargement de l'article..." />}

        {itemQuery.isError && (
          <ErrorState
            title="Article introuvable"
            message="Impossible de charger cet article pour modification."
            onRetry={() => itemQuery.refetch()}
            action={
              <Link
                href="/catalogue"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {itemQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier l&apos;article
              </h1>
              <p className="text-sm text-gray-500">
                {itemQuery.data.name} — {itemQuery.data.reference}
              </p>
            </div>

            {itemQuery.data.isArchived ? (
              <ErrorState
                title="Article archivé"
                message="Un article archivé ne peut plus être modifié."
                action={
                  <Link
                    href={`/catalogue/${id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Voir la fiche
                  </Link>
                }
              />
            ) : !canReadTaxRates && !taxRatesQuery.isLoading ? (
              <ErrorState
                title="Taux de TVA indisponibles"
                message="La permission settings.read est requise pour modifier la TVA."
              />
            ) : categoriesQuery.data && taxRatesQuery.data ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <CatalogItemForm
                  categories={categoriesQuery.data}
                  taxRates={taxRatesQuery.data}
                  defaultValues={itemToFormValues(itemQuery.data)}
                  isSubmitting={isBusy}
                  submitLabel="Enregistrer les modifications"
                  onSubmit={async (values) => {
                    const itemName = itemQuery.data.name;
                    await runAction({
                      confirm: {
                        title: "Enregistrer les modifications ?",
                        message: `Mettre à jour la fiche de ${itemName}.`,
                        confirmLabel: "Enregistrer",
                      },
                      loadingMessage: "Enregistrement de l'article...",
                      success: {
                        title: "Article mis à jour",
                        message: itemName,
                      },
                      error: {
                        title: "Modification impossible",
                        message: "Vérifiez les champs et réessayez.",
                      },
                      redirectTo: `/catalogue/${id}`,
                      redirectMessage: "Retour à la fiche article...",
                      action: () =>
                        updateItemMutation.mutateAsync({
                          id,
                          payload: buildUpdateItemPayload(values),
                        }),
                    });
                  }}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
