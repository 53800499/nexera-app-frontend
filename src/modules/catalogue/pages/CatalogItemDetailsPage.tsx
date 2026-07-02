"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useActionFeedback,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogItemDetailsCard } from "../components/CatalogItemDetailsCard";
import { CatalogItemPricesSection } from "../components/CatalogItemPricesSection";
import { useCatalogAccess } from "../hooks/useCatalogAccess";
import { useCatalogItem, useCatalogueItems } from "../hooks/useCatalogue";

export default function CatalogItemDetailsPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const { canManageCatalogue } = useCatalogAccess();
  const itemQuery = useCatalogItem(id);
  const { archiveItemMutation, unarchiveItemMutation } = useCatalogueItems();

  return (
    <RequireCatalogAccess>
      <div className="space-y-4">
        <Link
          href="/catalogue"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au catalogue
        </Link>

        {itemQuery.isLoading && (
          <LoadingBlock label="Chargement de la fiche article..." />
        )}

        {itemQuery.isError && (
          <ErrorState
            title="Article introuvable"
            message="Impossible de charger cette fiche article."
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

        {!itemQuery.isLoading && !itemQuery.isError && !itemQuery.data && (
          <EmptyState
            title="Article introuvable"
            description="Cet article n'existe pas."
            action={
              <Link
                href="/catalogue"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {itemQuery.data ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  Fiche article
                </h1>
                <p className="text-sm text-gray-500">
                  Détail, tarifs spécifiques et archivage.
                </p>
              </div>
              {canManageCatalogue ? (
                <div className="flex flex-wrap gap-2">
                  {!itemQuery.data.isArchived ? (
                    <>
                      <Link
                        href={`/catalogue/${itemQuery.data.id}/modifier`}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-500/40"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Archiver cet article ?",
                              message:
                                "Il ne pourra plus être utilisé dans de nouvelles transactions.",
                              confirmLabel: "Archiver",
                              variant: "warning",
                            },
                            loadingMessage: "Archivage de l'article...",
                            success: {
                              title: "Article archivé",
                              message: itemQuery.data.name,
                            },
                            error: {
                              title: "Archivage impossible",
                              message:
                                "L'article est peut-être utilisé dans des transactions (RM-A04).",
                            },
                            action: async () => {
                              await archiveItemMutation.mutateAsync(
                                itemQuery.data.id,
                              );
                              await itemQuery.refetch();
                            },
                          })
                        }
                      >
                        Archiver
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg border border-success-300 px-4 py-2 text-sm font-medium text-success-600 hover:bg-success-50 dark:border-success-500/40"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Désarchiver cet article ?",
                            message:
                              "L'article redeviendra actif et utilisable dans de nouvelles transactions.",
                            confirmLabel: "Désarchiver",
                          },
                          loadingMessage: "Désarchivage de l'article...",
                          success: {
                            title: "Article désarchivé",
                            message: itemQuery.data.name,
                          },
                          error: {
                            title: "Impossible de désarchiver l'article",
                          },
                          action: async () => {
                            await unarchiveItemMutation.mutateAsync(
                              itemQuery.data.id,
                            );
                            await itemQuery.refetch();
                          },
                        })
                      }
                    >
                      Désarchiver
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <CatalogItemDetailsCard item={itemQuery.data} />
            <CatalogItemPricesSection
              itemId={itemQuery.data.id}
              canManage={canManageCatalogue}
            />
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
