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
import {
  useCatalogPrice,
  useUpdateCatalogPrice,
} from "../hooks/useCatalogue";
import {
  buildUpdatePricePayload,
  priceToEditFormValues,
} from "../utils/catalogPriceMappers";

export default function EditCatalogPricePage({
  itemId,
  priceId,
}: {
  itemId: string;
  priceId: string;
}) {
  const { runAction, redirectWithLoader } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const priceQuery = useCatalogPrice(priceId);
  const { updatePriceMutation } = useUpdateCatalogPrice(itemId, priceId);

  const backHref = `/catalogue/${itemId}`;

  return (
    <RequireCatalogAccess requireManage>
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la fiche article
        </Link>

        {priceQuery.isLoading && (
          <LoadingBlock label="Chargement du tarif..." />
        )}

        {priceQuery.isError && (
          <ErrorState
            title="Tarif introuvable"
            message="Impossible de charger ce tarif."
            onRetry={() => priceQuery.refetch()}
            action={
              <Link
                href={backHref}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour à la fiche
              </Link>
            }
          />
        )}

        {priceQuery.data ? (
          <>
            {priceQuery.data.itemId !== itemId ? (
              <ErrorState
                title="Tarif incorrect"
                message="Ce tarif n'appartient pas à cet article."
                action={
                  <Link
                    href={`/catalogue/${priceQuery.data.itemId}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Voir l&apos;article associé
                  </Link>
                }
              />
            ) : priceQuery.data.item?.isArchived ? (
              <ErrorState
                title="Article archivé"
                message="Impossible de modifier un tarif d'un article archivé."
                action={
                  <Link
                    href={backHref}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Voir la fiche
                  </Link>
                }
              />
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Modifier le tarif
                  </h1>
                  <p className="text-sm text-gray-500">
                    {priceQuery.data.item?.name ?? "Article"} —{" "}
                    {priceQuery.data.item?.reference ?? ""}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <CatalogPriceForm
                    mode="edit"
                    price={priceQuery.data}
                    defaultValues={priceToEditFormValues(priceQuery.data)}
                    isSubmitting={isBusy}
                    submitLabel="Enregistrer les modifications"
                    onCancel={() =>
                      redirectWithLoader(backHref, "Retour à la fiche article...")
                    }
                    onSubmit={async (values) => {
                      const itemName =
                        priceQuery.data.item?.name ?? "l'article";
                      await runAction({
                        confirm: {
                          title: "Enregistrer les modifications ?",
                          message: `Mettre à jour le tarif de ${itemName}.`,
                          confirmLabel: "Enregistrer",
                        },
                        loadingMessage: "Enregistrement du tarif...",
                        success: {
                          title: "Tarif mis à jour",
                          message: itemName,
                        },
                        error: {
                          title: "Modification impossible",
                          message: "Vérifiez les champs et réessayez.",
                        },
                        redirectTo: backHref,
                        redirectMessage: "Retour à la fiche article...",
                        action: () =>
                          updatePriceMutation.mutateAsync(
                            buildUpdatePricePayload(values),
                          ),
                      });
                    }}
                  />
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
