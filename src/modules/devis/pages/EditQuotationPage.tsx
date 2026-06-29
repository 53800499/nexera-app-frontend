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
  buildUpdateQuotationPayload,
  QuotationForm,
} from "../components/QuotationForm";
import { RequireQuotationAccess } from "../components/RequireQuotationAccess";
import type { QuotationFormValues } from "../schemas/quotationForm.schema";
import { useQuotation, useQuotations } from "../hooks/useQuotations";
import { quotationToFormValues } from "../utils/quotationFormMapping";
import { canEditQuotation } from "../utils/quotationStatusRules";

export default function EditQuotationPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const quotationQuery = useQuotation(id);
  const { updateMutation } = useQuotations();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: QuotationFormValues) => {
    const quotation = await updateMutation.mutateAsync({
      id,
      payload: buildUpdateQuotationPayload(values),
    });
    toast.success("Devis mis à jour", quotation.number);
    router.push(`/devis/${quotation.id}`);
  };

  const quotation = quotationQuery.data;
  const canEdit = quotation ? canEditQuotation(quotation.status) : false;

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

        {quotationQuery.isPending && !quotationQuery.data && (
          <LoadingBlock label="Chargement du devis..." />
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

        {quotation && canEdit && taxRatesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier {quotation.number}
              </h1>
            </div>
            <QuotationForm
              isSubmitting={updateMutation.isPending}
              submitLabel="Enregistrer"
              taxRates={taxRatesQuery.data}
              lockClient
              defaultValues={quotationToFormValues(quotation)}
              onSubmit={submit}
            />
          </>
        ) : quotation && canEdit && taxRatesQuery.isLoading ? (
          <LoadingBlock label="Chargement des taux de TVA..." />
        ) : null}
      </div>
    </RequireQuotationAccess>
  );
}
