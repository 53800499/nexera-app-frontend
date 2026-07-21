"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../components/RequireStockAccess";
import { StockItemForm } from "../components/StockItemForm";
import {
  useStockByCatalogItem,
  useStockItemMutations,
  useWarehouses,
} from "../hooks/useStock";
import { useStockAccess } from "../hooks/useStockAccess";
import type { StockItemFormValues } from "../schemas/stockItemForm.schema";
import {
  buildStockItemPayload,
  stockItemToFormValues,
} from "../utils/stockMappers";

export default function StockArticleConfigPage({
  catalogItemId,
}: {
  catalogItemId: string;
}) {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const bundleQuery = useStockByCatalogItem(catalogItemId);
  const { warehousesQuery } = useWarehouses();
  const { createMutation, updateMutation } = useStockItemMutations();

  const isPageLoading = bundleQuery.isLoading || warehousesQuery.isLoading;
  const stockQty = bundleQuery.data?.catalogItem.stockQuantity ?? 0;
  const valuationLocked = stockQty > 0;

  const handleSubmit = async (values: StockItemFormValues) => {
    const payload = buildStockItemPayload(values);
    const existing = bundleQuery.data?.stockItem;

    await runAction({
      loadingMessage: "Enregistrement de la configuration...",
      success: {
        title: existing
          ? "Configuration stock mise à jour"
          : "Configuration stock créée",
      },
      error: {
        title: "Enregistrement impossible",
        message: "Vérifiez les champs et réessayez.",
      },
      action: async () => {
        if (existing) {
          await updateMutation.mutateAsync({ id: existing.id, payload });
        } else {
          await createMutation.mutateAsync({
            commercialItemId: catalogItemId,
            ...payload,
            storageUnit: payload.storageUnit!,
          });
        }
        await bundleQuery.refetch();
      },
    });
  };

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <Link
          href="/stock/articles"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux articles
        </Link>

        {isPageLoading && (
          <LoadingBlock label="Chargement de la configuration..." />
        )}

        {bundleQuery.isError && (
          <ErrorState
            title="Article introuvable"
            message="Impossible de charger cet article catalogue."
            onRetry={() => bundleQuery.refetch()}
          />
        )}

        {bundleQuery.data && warehousesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {bundleQuery.data.stockItem
                  ? "Configuration stock"
                  : "Configurer le stock"}
              </h1>
              <p className="text-sm text-gray-500">
                {bundleQuery.data.catalogItem.name} —{" "}
                {bundleQuery.data.catalogItem.reference}
              </p>
            </div>

            {canManageStock ? (
              <StockItemForm
                key={bundleQuery.data.stockItem?.id ?? "new"}
                isSubmitting={isBusy}
                submitLabel="Enregistrer"
                warehouses={warehousesQuery.data}
                valuationLocked={valuationLocked}
                defaultValues={
                  bundleQuery.data.stockItem
                    ? stockItemToFormValues(
                        bundleQuery.data.stockItem,
                        bundleQuery.data.catalogItem.unit,
                      )
                    : {
                        storageUnit: bundleQuery.data.catalogItem.unit,
                        conversionFactor: 1,
                        valuationMethod: "cmup",
                        trackLots: false,
                        trackSerials: false,
                        trackExpiry: false,
                        allowNegativeStock: false,
                      }
                }
                onSubmit={handleSubmit}
              />
            ) : bundleQuery.data.stockItem ? (
              <p className="text-sm text-gray-500">
                Lecture seule — vous n&apos;avez pas la permission de modifier
                la configuration stock.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Cet article n&apos;a pas encore de configuration stock.
              </p>
            )}
          </>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
