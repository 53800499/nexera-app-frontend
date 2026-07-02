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
  buildUpdateQuotationPayload,
  QuotationForm,
} from "../components/QuotationForm";
import { RequireQuotationAccess } from "../components/RequireQuotationAccess";
import type { QuotationFormValues } from "../schemas/quotationForm.schema";
import { useQuotation, useQuotations } from "../hooks/useQuotations";
import { quotationToFormValues } from "../utils/quotationFormMapping";
import { canEditQuotation } from "../utils/quotationStatusRules";

export default function EditQuotationPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const quotationQuery = useQuotation(id);
  const { updateMutation } = useQuotations();
  const taxRatesQuery = useTaxRates();

  const quotation = quotationQuery.data;
  const canEdit = quotation ? canEditQuotation(quotation.status) : false;
  const isPageLoading =
    (quotationQuery.isPending && !quotationQuery.data) ||
    (canEdit && taxRatesQuery.isLoading && !taxRatesQuery.data);

  const submit = async (values: QuotationFormValues) => {
    const number = quotation?.number ?? "devis";
    await runAction({
      confirm: {
        title: "Enregistrer les modifications ?",
        message: `Mettre à jour le devis ${number}.`,
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement du devis...",
      success: {
        title: "Devis mis à jour",
        message: number,
      },
      redirectTo: `/devis/${id}`,
      redirectMessage: "Retour au détail du devis...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        updateMutation.mutateAsync({
          id,
          payload: buildUpdateQuotationPayload(values),
        }),
    });
  };

  return (
    <RequireQuotationAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/devis/${id}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au devis
        </Link>

        {isPageLoading && (
          <LoadingBlock label="Chargement du formulaire de devis..." />
        )}

        {quotationQuery.isError && (
          <ErrorState
            title="Devis introuvable"
            message="Impossible de charger ce devis."
            onRetry={() => quotationQuery.refetch()}
          />
        )}

        {quotation && !canEdit ? (
          <ErrorState
            title="Modification impossible"
            message="Ce devis ne peut plus être modifié dans son statut actuel."
            action={
              <Link
                href={`/devis/${id}`}
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

        {quotation && canEdit && taxRatesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier {quotation.number}
              </h1>
            </div>
            <QuotationForm
              isSubmitting={isBusy}
              submitLabel="Enregistrer"
              taxRates={taxRatesQuery.data}
              lockClient
              defaultValues={quotationToFormValues(quotation)}
              onSubmit={submit}
            />
          </>
        ) : null}
      </div>
    </RequireQuotationAccess>
  );
}
