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
  buildCreateInvoicePayload,
  InvoiceForm,
} from "../components/InvoiceForm";
import { RequireInvoiceAccess } from "../components/RequireInvoiceAccess";
import type { InvoiceFormValues } from "../schemas/invoiceForm.schema";
import { useInvoices } from "../hooks/useInvoices";

type Props = {
  defaultClientId?: string;
  defaultOrderId?: string;
  defaultQuotationId?: string;
  orderLabel?: string;
  quotationLabel?: string;
};

export default function CreateInvoicePage({
  defaultClientId,
  defaultOrderId,
  defaultQuotationId,
  orderLabel,
  quotationLabel,
}: Props) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { createMutation } = useInvoices();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: InvoiceFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer cette facture ?",
        message: "La facture sera créée en brouillon.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement de la facture...",
      success: {
        title: "Facture créée",
        message: "Brouillon enregistré avec succès.",
      },
      redirectTo: (invoice) => `/factures/${invoice.id}`,
      redirectMessage: "Ouverture de la facture...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        createMutation.mutateAsync(buildCreateInvoicePayload(values)),
    });
  };

  return (
    <RequireInvoiceAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/factures"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux factures
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvelle facture
          </h1>
          <p className="text-sm text-gray-500">
            Créez un brouillon, puis émettez pour obtenir le numéro définitif.
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
          <InvoiceForm
            isSubmitting={isBusy}
            submitLabel="Enregistrer le brouillon"
            taxRates={taxRatesQuery.data}
            lockOrder={Boolean(defaultOrderId)}
            lockQuotation={Boolean(defaultQuotationId)}
            orderLabel={orderLabel}
            quotationLabel={quotationLabel}
            defaultValues={{
              ...(defaultClientId ? { clientId: defaultClientId } : {}),
              ...(defaultOrderId ? { orderId: defaultOrderId } : {}),
              ...(defaultQuotationId ? { quotationId: defaultQuotationId } : {}),
            }}
            onSubmit={submit}
          />
        ) : null}
      </div>
    </RequireInvoiceAccess>
  );
}
