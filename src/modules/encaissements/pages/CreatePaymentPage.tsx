"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import { useToast } from "@/shared/components/feedback";
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
  const router = useRouter();
  const toast = useToast();
  const { createMutation } = usePayments();

  const submit = async (values: PaymentFormValues) => {
    const payment = await createMutation.mutateAsync(
      buildCreatePaymentPayload(values),
    );
    toast.success("Encaissement enregistré");
    router.push(`/encaissements/${payment.id}`);
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
            Sélectionnez un client, saisissez le montant reçu et imputez les factures ouvertes.
          </p>
        </div>

        <PaymentForm
          isSubmitting={createMutation.isPending}
          submitLabel="Enregistrer l'encaissement"
          defaultClientId={defaultClientId}
          onSubmit={submit}
        />
      </div>
    </RequirePaymentAccess>
  );
}
