"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import { PaymentPdfPreviewModal } from "../components/PaymentPdfPreviewModal";
import { RequirePaymentAccess } from "../components/RequirePaymentAccess";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";
import { usePaymentAccess } from "../hooks/usePaymentAccess";
import { usePayment, usePayments } from "../hooks/usePayments";
import { usePaymentPdf } from "../pdf/usePaymentPdf";
import {
  formatPaymentMoney,
  paymentMethodLabel,
} from "../utils/paymentLabels";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function PaymentDetailsPage({ id }: { id: string }) {
  const { runAction, showResult } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManagePayments } = usePaymentAccess();
  const paymentQuery = usePayment(id);
  const { cancelMutation } = usePayments();
  const { preview, openPreview, downloadPdf, closePreview } = usePaymentPdf();
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(
    null,
  );
  const [showCancelForm, setShowCancelForm] = useState(false);

  const payment = paymentQuery.data;
  const paymentLabel =
    payment?.reference?.trim() ||
    `${payment?.clientName ?? "Client"} — ${payment ? formatDate(payment.paymentDate) : ""}`;

  const handlePreview = () => {
    if (!payment) return;
    void runAction({
      loadingMessage: "Génération de l'aperçu...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () => openPreview(payment),
    }).catch((error) => {
      void showResult({
        variant: "error",
        title: "Aperçu impossible",
        message: resolveFormErrorMessage(error),
      });
    });
  };

  const handleDownloadPdf = () => {
    if (!payment) return;
    void runAction({
      loadingMessage: "Génération du PDF...",
      success: { title: "PDF téléchargé" },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => downloadPdf(payment),
    }).catch((error) => {
      void showResult({
        variant: "error",
        title: "Génération PDF impossible",
        message: resolveFormErrorMessage(error),
      });
    });
  };

  const handleCancel = async () => {
    setCancelReasonError(null);

    if (!cancelReason.trim()) {
      const message = "Indiquez la raison de l'annulation pour continuer.";
      setCancelReasonError(message);
      void showResult({
        variant: "error",
        title: "Motif obligatoire",
        message,
      });
      return;
    }

    await runAction({
      confirm: {
        title: "Annuler cet encaissement ?",
        message:
          "Cette action est irréversible. Les imputations seront annulées.",
        confirmLabel: "Confirmer l'annulation",
        variant: "danger",
      },
      loadingMessage: "Annulation en cours...",
      success: {
        title: "Encaissement annulé",
        message: "L'encaissement a été annulé avec succès.",
      },
      error: {
        title: "Annulation impossible",
        message:
          "Vérifiez le motif saisi et le statut de l'encaissement, puis réessayez.",
      },
      action: async () => {
        await cancelMutation.mutateAsync({
          id,
          payload: { reason: cancelReason.trim() },
        });
        setShowCancelForm(false);
        setCancelReason("");
        await paymentQuery.refetch();
      },
    });
  };

  return (
    <RequirePaymentAccess>
      <div className="space-y-4">
        <Link
          href="/encaissements"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux encaissements
        </Link>

        {paymentQuery.isPending && !paymentQuery.data && (
          <LoadingBlock label="Chargement de l'encaissement..." />
        )}

        {paymentQuery.isError && (
          <ErrorState
            title="Encaissement introuvable"
            message="Impossible de charger cet encaissement. Vérifiez l'identifiant ou réessayez."
            onRetry={() => paymentQuery.refetch()}
          />
        )}

        {payment ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Encaissement
                  </h1>
                  <PaymentStatusBadge isCancelled={payment.isCancelled} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {payment.clientName ?? payment.clientId} —{" "}
                  {formatDate(payment.paymentDate)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handlePreview}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Aperçu
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleDownloadPdf}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  PDF
                </button>
                {canManagePayments && !payment.isCancelled ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setShowCancelForm((value) => !value)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Annuler l&apos;encaissement
                  </button>
                ) : null}
              </div>
            </div>

            {showCancelForm && !payment.isCancelled ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                <h2 className="mb-3 font-medium text-red-800 dark:text-red-300">
                  Annulation (motif obligatoire)
                </h2>
                <div className="space-y-3">
                  <div data-form-field="cancelReason">
                    <Label>Motif</Label>
                    <Input
                      value={cancelReason}
                      onChange={(event) => {
                        setCancelReason(event.target.value);
                        setCancelReasonError(null);
                      }}
                      placeholder="Erreur de saisie, chèque impayé..."
                    />
                    {cancelReasonError ? (
                      <p className="mt-1 text-xs text-red-600">
                        {cancelReasonError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={cancelMutation.isPending || isBusy}
                      onClick={() => void handleCancel()}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Confirmer l&apos;annulation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelForm(false);
                        setCancelReasonError(null);
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {payment.isCancelled && payment.cancelReason ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                Annulé le{" "}
                {payment.cancelledAt
                  ? formatDate(payment.cancelledAt)
                  : "—"}{" "}
                — Motif : {payment.cancelReason}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-3 font-medium">Informations</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Montant</dt>
                    <dd className="font-medium">
                      {formatPaymentMoney(payment.amount, payment.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Mode</dt>
                    <dd>{paymentMethodLabel(payment.paymentMethod)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Référence</dt>
                    <dd>{payment.reference ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Taux de change</dt>
                    <dd>{payment.exchangeRate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Avance non imputée</dt>
                    <dd>
                      {payment.unallocatedAmount > 0
                        ? formatPaymentMoney(
                            payment.unallocatedAmount,
                            payment.currency,
                          )
                        : "—"}
                    </dd>
                  </div>
                </dl>
                {payment.notes ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {payment.notes}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h2 className="mb-3 font-medium">Client</h2>
                <p className="font-medium">{payment.clientName ?? "—"}</p>
                <Link
                  href={`/clients/${payment.clientId}`}
                  className="mt-2 inline-block text-sm text-brand-600 hover:underline"
                >
                  Voir la fiche client
                </Link>
              </div>
            </div>

            {payment.imputations.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Imputations</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm">
                    {payment.imputations.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                      >
                        <Link
                          href={`/factures/${row.invoiceId}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {row.invoiceNumber ?? row.invoiceId}
                        </Link>
                        <span className="font-medium">
                          {formatPaymentMoney(row.amount, payment.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {payment.advanceCreated ? (
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                Avance client créée :{" "}
                {formatPaymentMoney(
                  payment.advanceCreated.remainingAmount,
                  payment.advanceCreated.currency,
                )}
              </p>
            ) : null}
          </>
        ) : null}

        <PaymentPdfPreviewModal
          preview={preview}
          paymentLabel={paymentLabel}
          onClose={closePreview}
        />
      </div>
    </RequirePaymentAccess>
  );
}
