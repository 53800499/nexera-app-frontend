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
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { createMutation } = useOrders();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: OrderFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer ce bon de commande ?",
        message: "Le BC sera créé en brouillon.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement du bon de commande...",
      success: {
        title: "Bon de commande créé",
        message: "Brouillon enregistré avec succès.",
      },
      redirectTo: (order) => `/commandes/${order.id}`,
      redirectMessage: "Ouverture du bon de commande...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        createMutation.mutateAsync(buildCreateOrderPayload(values)),
    });
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
            Sélectionnez un client, ajoutez les lignes et enregistrez en
            brouillon.
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
            isSubmitting={isBusy}
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
