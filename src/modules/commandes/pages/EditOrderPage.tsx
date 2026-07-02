"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { useTaxRates } from "@/modules/catalogue/hooks/useCatalogue";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  buildUpdateOrderPayload,
  OrderForm,
} from "../components/OrderForm";
import { RequireOrderAccess } from "../components/RequireOrderAccess";
import type { OrderFormValues } from "../schemas/orderForm.schema";
import { useOrder, useOrders } from "../hooks/useOrders";
import { orderToFormValues } from "../utils/orderFormMapping";
import { canEditOrder } from "../utils/orderStatusRules";

export default function EditOrderPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const orderQuery = useOrder(id);
  const { updateMutation } = useOrders();
  const taxRatesQuery = useTaxRates();

  const order = orderQuery.data;
  const canEdit = order ? canEditOrder(order.status) : false;
  const isPageLoading =
    (orderQuery.isPending && !orderQuery.data) ||
    (canEdit && taxRatesQuery.isLoading && !taxRatesQuery.data);

  const submit = async (values: OrderFormValues) => {
    const number = order?.number ?? "BC";
    await runAction({
      confirm: {
        title: "Enregistrer les modifications ?",
        message: `Mettre à jour le bon de commande ${number}.`,
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement du bon de commande...",
      success: {
        title: "BC mis à jour",
        message: number,
      },
      redirectTo: `/commandes/${id}`,
      redirectMessage: "Retour au détail du BC...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        updateMutation.mutateAsync({
          id,
          payload: buildUpdateOrderPayload(values),
        }),
    });
  };

  return (
    <RequireOrderAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/commandes/${id}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au BC
        </Link>

        {isPageLoading && (
          <LoadingBlock label="Chargement du formulaire de commande..." />
        )}

        {orderQuery.isError && (
          <ErrorState
            title="BC introuvable"
            message="Impossible de charger ce bon de commande."
            onRetry={() => orderQuery.refetch()}
          />
        )}

        {order && !canEdit ? (
          <ErrorState
            title="Modification impossible"
            message="Ce bon de commande ne peut plus être modifié dans son statut actuel."
            action={
              <Link
                href={`/commandes/${id}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Voir le détail
              </Link>
            }
          />
        ) : null}

        {taxRatesQuery.isError && canEdit ? (
          <ErrorState
            title="Configuration TVA indisponible"
            message="Impossible de charger les taux de TVA."
            onRetry={() => taxRatesQuery.refetch()}
          />
        ) : null}

        {order && canEdit && taxRatesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier {order.number}
              </h1>
            </div>
            <OrderForm
              isSubmitting={isBusy}
              submitLabel="Enregistrer"
              taxRates={taxRatesQuery.data}
              lockClient
              lockQuotation={Boolean(order.quotationId)}
              quotationLabel={order.quotation?.number}
              defaultValues={orderToFormValues(order)}
              onSubmit={submit}
            />
          </>
        ) : null}
      </div>
    </RequireOrderAccess>
  );
}
