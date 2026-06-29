"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import { useTaxRates } from "@/modules/catalogue/hooks/useCatalogue";
import {
  ErrorState,
  LoadingBlock,
  useToast,
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
  const router = useRouter();
  const toast = useToast();
  const orderQuery = useOrder(id);
  const { updateMutation } = useOrders();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: OrderFormValues) => {
    const order = await updateMutation.mutateAsync({
      id,
      payload: buildUpdateOrderPayload(values),
    });
    toast.success("BC mis à jour", order.number);
    router.push(`/commandes/${order.id}`);
  };

  const order = orderQuery.data;
  const canEdit = order ? canEditOrder(order.status) : false;

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

        {orderQuery.isPending && !orderQuery.data && (
          <LoadingBlock label="Chargement du bon de commande..." />
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

        {order && canEdit && taxRatesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier {order.number}
              </h1>
            </div>
            <OrderForm
              isSubmitting={updateMutation.isPending}
              submitLabel="Enregistrer"
              taxRates={taxRatesQuery.data}
              lockClient
              lockQuotation={Boolean(order.quotationId)}
              quotationLabel={order.quotation?.number}
              defaultValues={orderToFormValues(order)}
              onSubmit={submit}
            />
          </>
        ) : order && canEdit && taxRatesQuery.isLoading ? (
          <LoadingBlock label="Chargement des taux de TVA..." />
        ) : null}
      </div>
    </RequireOrderAccess>
  );
}
