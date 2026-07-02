"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  buildCreatePaymentPayload,
  PaymentForm,
} from "../components/PaymentForm";
import { RequirePaymentAccess } from "../components/RequirePaymentAccess";
import type { PaymentFormValues } from "../schemas/paymentForm.schema";
import { usePayments } from "../hooks/usePayments";

type Props = {
  defaultClientId?: string;
};

export default function CreatePaymentPage({ defaultClientId }: Props) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { createMutation } = usePayments();

  const submit = async (values: PaymentFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer cet encaissement ?",
        message:
          "Le montant sera enregistré et imputé sur les factures ouvertes du client.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement de l'encaissement...",
      success: {
        title: "Encaissement enregistré",
        message: "Le paiement a été enregistré avec succès.",
      },
      redirectTo: (payment) => `/encaissements/${payment.id}`,
      redirectMessage: "Ouverture de l'encaissement...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        createMutation.mutateAsync(buildCreatePaymentPayload(values)),
    });
  };

  return (
    <RequirePaymentAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/encaissements"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux encaissements
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau paiement
          </h1>
          <p className="text-sm text-gray-500">
            Sélectionnez un client, saisissez le montant reçu et imputez les
            factures ouvertes.
          </p>
        </div>

        <PaymentForm
          isSubmitting={createMutation.isPending || isBusy}
          submitLabel="Enregistrer l'encaissement"
          defaultClientId={defaultClientId}
          onSubmit={submit}
        />
      </div>
    </RequirePaymentAccess>
  );
}
