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
  buildCreateQuotationPayload,
  QuotationForm,
} from "../components/QuotationForm";
import { RequireQuotationAccess } from "../components/RequireQuotationAccess";
import type { QuotationFormValues } from "../schemas/quotationForm.schema";
import { useQuotations } from "../hooks/useQuotations";

type Props = {
  defaultClientId?: string;
};

export default function CreateQuotationPage({ defaultClientId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { createMutation } = useQuotations();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: QuotationFormValues) => {
    const quotation = await createMutation.mutateAsync(
      buildCreateQuotationPayload(values),
    );
    toast.success("Devis créé", quotation.number);
    router.push(`/devis/${quotation.id}`);
  };

  return (
    <RequireQuotationAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/devis"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux devis
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau devis
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
          <QuotationForm
            isSubmitting={createMutation.isPending}
            submitLabel="Enregistrer le brouillon"
            taxRates={taxRatesQuery.data}
            defaultValues={
              defaultClientId ? { clientId: defaultClientId } : undefined
            }
            onSubmit={submit}
          />
        ) : null}
      </div>
    </RequireQuotationAccess>
  );
}
