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
import { CatalogPriceForm } from "../components/CatalogPriceForm";
import { useCatalogItem, useCatalogItemPrices } from "../hooks/useCatalogue";
import { buildCreatePricePayload } from "../utils/catalogPriceMappers";

export default function CreateCatalogPricePage({ itemId }: { itemId: string }) {
  const { runAction, redirectWithLoader } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const itemQuery = useCatalogItem(itemId);
  const { createPriceMutation } = useCatalogItemPrices(itemId);

  return (
    <RequireCatalogAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/catalogue/${itemId}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la fiche article
        </Link>

        {itemQuery.isLoading && (
          <LoadingBlock label="Chargement de l'article..." />
        )}

        {itemQuery.isError && (
          <ErrorState
            title="Article introuvable"
            message="Impossible de charger cet article."
            action={
              <Link
                href="/catalogue"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour au catalogue
              </Link>
            }
          />
        )}

        {itemQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Nouveau tarif
              </h1>
              <p className="text-sm text-gray-500">
                {itemQuery.data.name} — {itemQuery.data.reference}
              </p>
            </div>

            {itemQuery.data.isArchived ? (
              <ErrorState
                title="Article archivé"
                message="Impossible d'ajouter un tarif à un article archivé."
                action={
                  <Link
                    href={`/catalogue/${itemId}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Voir la fiche
                  </Link>
                }
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <CatalogPriceForm
                  mode="create"
                  isSubmitting={isBusy}
                  submitLabel="Ajouter le tarif"
                  onCancel={() =>
                    redirectWithLoader(
                      `/catalogue/${itemId}`,
                      "Retour à la fiche article...",
                    )
                  }
                  onSubmit={async (values, clientId) => {
                    await runAction({
                      confirm: {
                        title: "Ajouter ce tarif ?",
                        message: `Confirmer l'ajout d'un tarif spécifique pour ${itemQuery.data.name}.`,
                        confirmLabel: "Ajouter",
                      },
                      loadingMessage: "Ajout du tarif...",
                      success: {
                        title: "Tarif ajouté",
                        message: itemQuery.data.name,
                      },
                      error: {
                        title: "Impossible d'ajouter le tarif",
                        message: "Vérifiez les champs et réessayez.",
                      },
                      redirectTo: `/catalogue/${itemId}`,
                      redirectMessage: "Retour à la fiche article...",
                      action: () =>
                        createPriceMutation.mutateAsync(
                          buildCreatePricePayload(values, clientId),
                        ),
                    });
                  }}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
