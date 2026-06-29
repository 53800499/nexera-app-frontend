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
  buildUpdateInvoicePayload,
  InvoiceForm,
} from "../components/InvoiceForm";
import { RequireInvoiceAccess } from "../components/RequireInvoiceAccess";
import type { InvoiceFormValues } from "../schemas/invoiceForm.schema";
import { useInvoice, useInvoices } from "../hooks/useInvoices";
import { invoiceToFormValues } from "../utils/invoiceFormMapping";
import { canEditInvoice } from "../utils/invoiceStatusRules";

export default function EditInvoicePage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const invoiceQuery = useInvoice(id);
  const { updateMutation } = useInvoices();
  const taxRatesQuery = useTaxRates();

  const submit = async (values: InvoiceFormValues) => {
    const invoice = await updateMutation.mutateAsync({
      id,
      payload: buildUpdateInvoicePayload(values),
    });
    toast.success("Facture mise à jour", invoice.number);
    router.push(`/factures/${invoice.id}`);
  };

  const invoice = invoiceQuery.data;
  const canEdit = invoice ? canEditInvoice(invoice.status) : false;

  return (
    <RequireInvoiceAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/factures/${id}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la facture
        </Link>

        {invoiceQuery.isPending && !invoiceQuery.data && (
          <LoadingBlock label="Chargement de la facture..." />
        )}

        {invoiceQuery.isError && (
          <ErrorState
            title="Facture introuvable"
            message="Impossible de charger cette facture."
            onRetry={() => invoiceQuery.refetch()}
          />
        )}

        {invoice && !canEdit ? (
          <ErrorState
            title="Modification impossible"
            message="Cette facture ne peut plus être modifiée dans son statut actuel."
            action={
              <Link
                href={`/factures/${id}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Voir le détail
              </Link>
            }
          />
        ) : null}

        {invoice && canEdit && taxRatesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier {invoice.number}
              </h1>
            </div>
            <InvoiceForm
              isSubmitting={updateMutation.isPending}
              submitLabel="Enregistrer"
              taxRates={taxRatesQuery.data}
              lockClient
              lockOrder={Boolean(invoice.orderId)}
              lockQuotation={Boolean(invoice.quotationId)}
              orderLabel={invoice.order?.number}
              quotationLabel={invoice.quotation?.number}
              defaultValues={invoiceToFormValues(invoice)}
              onSubmit={submit}
            />
          </>
        ) : invoice && canEdit && taxRatesQuery.isLoading ? (
          <LoadingBlock label="Chargement des taux de TVA..." />
        ) : null}
      </div>
    </RequireInvoiceAccess>
  );
}
