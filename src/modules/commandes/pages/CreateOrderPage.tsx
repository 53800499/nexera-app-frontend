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
  buildCreateOrderPayload,
  OrderForm,
} from "../components/OrderForm";
import { RequireOrderAccess } from "../components/RequireOrderAccess";
import type { OrderFormValues } from "../schemas/orderForm.schema";
import { useOrders } from "../hooks/useOrders";

type Props = {
  defaultClientId?: string;
  defaultQuotationId?: string;
  quotationLabel?: string;
};

export default function CreateOrderPage({
  defaultClientId,
  defaultQuotationId,
  quotationLabel,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const { createMutation } = useOrders();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: OrderFormValues) => {
    const order = await createMutation.mutateAsync(
      buildCreateOrderPayload(values),
    );
    toast.success("Bon de commande créé", order.number);
    router.push(`/commandes/${order.id}`);
  };

  return (
    <RequireOrderAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/commandes"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux commandes
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau bon de commande
          </h1>
          <p className="text-sm text-gray-500">
            Sélectionnez un client, ajoutez les lignes et enregistrez en brouillon.
          </p>
        </div>

        {taxRatesQuery.isLoading && (
          <LoadingBlock label="Chargement des taux de TVA..." />
        )}

        {taxRatesQuery.isError && (
          <ErrorState
            title="Configuration TVA indisponible"
            message="Impossible de charger les taux de TVA."
            onRetry={() => taxRatesQuery.refetch()}
          />
        )}

        {taxRatesQuery.data ? (
          <OrderForm
            isSubmitting={createMutation.isPending}
            submitLabel="Enregistrer le brouillon"
            taxRates={taxRatesQuery.data}
            lockQuotation={Boolean(defaultQuotationId)}
            quotationLabel={quotationLabel}
            defaultValues={{
              ...(defaultClientId ? { clientId: defaultClientId } : {}),
              ...(defaultQuotationId ? { quotationId: defaultQuotationId } : {}),
            }}
            onSubmit={submit}
          />
        ) : null}
      </div>
    </RequireOrderAccess>
  );
}
