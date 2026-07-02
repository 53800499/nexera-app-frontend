"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import { formatMoney } from "@/modules/devis/utils/quotationCalculations";
import { ManualReminderForm } from "@/modules/relances/components/ManualReminderForm";
import { ReminderLevelBadge } from "@/modules/relances/components/ReminderLevelBadge";
import { useReminderAccess } from "@/modules/relances/hooks/useReminderAccess";
import {
  useInvoiceReminders,
  useReminders,
} from "@/modules/relances/hooks/useReminders";
import type { ManualReminderFormValues } from "@/modules/relances/schemas/reminderForm.schema";
import {
  reminderChannelLabel,
  reminderTypeLabel,
} from "@/modules/relances/utils/reminderLabels";
import { canSendManualReminder } from "@/modules/relances/utils/reminderStatusRules";
import { useInvoicePdf } from "../pdf/useInvoicePdf";
import { InvoicePdfPreviewModal } from "../components/InvoicePdfPreviewModal";
import { RequireInvoiceAccess } from "../components/RequireInvoiceAccess";
import { InvoicePaymentForm } from "../components/InvoicePaymentForm";
import { InvoiceStatusBadge } from "../components/InvoiceStatusBadge";
import { useInvoiceAccess } from "../hooks/useInvoiceAccess";
import { useInvoice, useInvoices } from "../hooks/useInvoices";
import type { InvoiceLine } from "../types/invoice.types";
import {
  invoiceStatusLabel,
  invoiceTypeLabel,
  normalizeInvoiceStatus,
  normalizeInvoiceType,
} from "../utils/invoiceLabels";
import {
  canCreateCreditNote,
  canDeleteInvoice,
  canDownloadInvoicePdf,
  canEditInvoice,
  canIssueInvoice,
  canRecordInvoicePayment,
  canSendInvoice,
  isInvoiceTerminal,
} from "../utils/invoiceStatusRules";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wire: "Virement",
  check: "Chèque",
  cash: "Espèces",
  card: "Carte",
  other: "Autre",
};

const lineColumns = (currency: string): DataTableColumn<InvoiceLine>[] => [
  {
    key: "description",
    header: "Description",
    render: (line) => (
      <div>
        <p className="font-medium">{line.description}</p>
        {line.item ? (
          <p className="text-xs text-gray-500">{line.item.reference}</p>
        ) : null}
      </div>
    ),
  },
  {
    key: "qty",
    header: "Qté",
    render: (line) => line.quantity,
  },
  {
    key: "unit",
    header: "P.U. HT",
    render: (line) => formatMoney(line.unitPriceHt, currency),
  },
  {
    key: "discount",
    header: "Remise",
    render: (line) => `${line.discountPct}%`,
  },
  {
    key: "tax",
    header: "TVA",
    render: (line) => `${line.taxRate?.rate ?? 0}%`,
  },
  {
    key: "total",
    header: "Total TTC",
    render: (line) => formatMoney(line.lineTotalTtc, currency),
  },
];

export default function InvoiceDetailsPage({ id }: { id: string }) {
  const { runAction, showResult } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { preview, openPreview, downloadPdf, closePreview } = useInvoicePdf();
  const { canManageInvoices } = useInvoiceAccess();
  const invoiceQuery = useInvoice(id);
  const {
    removeMutation,
    issueMutation,
    sendMutation,
    creditNoteMutation,
    recordPaymentMutation,
  } = useInvoices();
  const [creditAmount, setCreditAmount] = useState<number | "">("");
  const [creditAmountError, setCreditAmountError] = useState<string | null>(null);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  const { canManageReminders } = useReminderAccess();
  const invoiceRemindersQuery = useInvoiceReminders(id);
  const { sendManualMutation } = useReminders();

  const invoice = invoiceQuery.data;
  const status = invoice ? normalizeInvoiceStatus(invoice.status) : null;
  const discountPct = invoice?.discountPct ?? 0;
  const payments = invoice?.payments ?? [];
  const creditNotes = invoice?.creditNotes ?? [];
  const lines = invoice?.lines ?? [];
  const invoiceReminders = invoiceRemindersQuery.data ?? [];

  const handlePreview = () => {
    if (!invoice) return;
    void runAction({
      loadingMessage: "Génération de l'aperçu...",
      showResultOnError: false,
      rethrowOnError: true,
      action: () => openPreview(invoice),
    }).catch((error) => {
      void showResult({
        variant: "error",
        title: "Aperçu impossible",
        message: resolveFormErrorMessage(error),
      });
    });
  };

  const handleDownloadPdf = () => {
    if (!invoice) return;
    void runAction({
      loadingMessage: "Génération du PDF...",
      success: { title: "PDF téléchargé" },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => downloadPdf(invoice),
    }).catch((error) => {
      void showResult({
        variant: "error",
        title: "Génération PDF impossible",
        message: resolveFormErrorMessage(error),
      });
    });
  };

  const createCreditNote = async () => {
    setCreditAmountError(null);

    if (creditAmount !== "" && creditAmount > invoice!.amountDue) {
      const message = `Le montant ne peut pas dépasser le reste dû (${invoice!.amountDue.toFixed(2)} ${invoice!.currency}).`;
      setCreditAmountError(message);
      void showResult({
        variant: "error",
        title: "Avoir impossible",
        message,
      });
      return;
    }

    const payload =
      creditAmount !== "" && creditAmount > 0
        ? { amountTtc: creditAmount }
        : {};

    await runAction({
      confirm: {
        title: "Créer un avoir ?",
        message: "Un nouvel avoir sera généré à partir de cette facture.",
        confirmLabel: "Créer l'avoir",
        variant: "warning",
      },
      loadingMessage: "Création de l'avoir...",
      success: {
        title: "Avoir créé",
        message: "Redirection vers le nouvel avoir.",
      },
      redirectTo: (creditNote) => `/factures/${creditNote.id}`,
      redirectMessage: "Ouverture de l'avoir...",
      showResultOnError: false,
      rethrowOnError: true,
      action: async () => {
        const created = await creditNoteMutation.mutateAsync({ id, payload });
        setShowCreditForm(false);
        setCreditAmount("");
        await invoiceQuery.refetch();
        return created;
      },
    }).catch((error) => {
      const message = resolveFormErrorMessage(error);
      setCreditAmountError(message);
      void showResult({
        variant: "error",
        title: "Création d'avoir impossible",
        message,
      });
    });
  };

  return (
    <RequireInvoiceAccess>
      <div className="space-y-4">
        <Link
          href="/factures"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux factures
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

        {invoice && status ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {invoice.number}
                  </h1>
                  <InvoiceStatusBadge status={status} />
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {invoiceTypeLabel(normalizeInvoiceType(invoice.invoiceType))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {invoice.client?.companyName ?? "Client"} — émise le{" "}
                  {formatDate(invoice.issueDate)}
                  {invoice.dueDate
                    ? ` — échéance ${formatDate(invoice.dueDate)}`
                    : ""}
                </p>
              </div>

              {canManageInvoices ? (
                <div className="flex flex-wrap gap-2">
                  {canEditInvoice(status) ? (
                    <Link
                      href={`/factures/${invoice.id}/modifier`}
                      className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
                    >
                      Modifier
                    </Link>
                  ) : null}
                  {canIssueInvoice(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Émettre la facture ?",
                            message:
                              "La facture passera au statut émis et ne pourra plus être modifiée librement.",
                            confirmLabel: "Émettre",
                          },
                          loadingMessage: "Émission de la facture...",
                          success: {
                            title: "Facture émise",
                            message: invoice.number,
                          },
                          action: async () => {
                            await issueMutation.mutateAsync(invoice.id);
                            await invoiceQuery.refetch();
                          },
                        })
                      }
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Émettre
                    </button>
                  ) : null}
                  {canSendInvoice(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Envoyer la facture ?",
                            message:
                              "La facture sera marquée comme envoyée au client.",
                            confirmLabel: "Envoyer",
                          },
                          loadingMessage: "Envoi de la facture...",
                          success: {
                            title: "Facture envoyée",
                            message: invoice.number,
                          },
                          error: {
                            title: "Envoi impossible",
                            message:
                              "Vérifiez le statut de la facture, l'e-mail du client et la configuration d'envoi dans Paramètres.",
                          },
                          action: async () => {
                            await sendMutation.mutateAsync({ id: invoice.id });
                            await invoiceQuery.refetch();
                          },
                        })
                      }
                      className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      Envoyer
                    </button>
                  ) : null}
                  {canDownloadInvoicePdf(status) ? (
                    <>
                      <button
                        type="button"
                        onClick={handlePreview}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Aperçu
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        PDF
                      </button>
                    </>
                  ) : null}
                  {canCreateCreditNote(status) ? (
                    <button
                      type="button"
                      onClick={() => setShowCreditForm((value) => !value)}
                      className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                    >
                      Créer un avoir
                    </button>
                  ) : null}
                  {canDeleteInvoice(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Supprimer ce brouillon ?",
                            message:
                              "Cette facture sera définitivement supprimée.",
                            confirmLabel: "Supprimer",
                            variant: "danger",
                          },
                          loadingMessage: "Suppression en cours...",
                          success: { title: "Facture supprimée" },
                          redirectTo: "/factures",
                          redirectMessage: "Retour à la liste des factures...",
                          action: () => removeMutation.mutateAsync(invoice.id),
                        })
                      }
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isInvoiceTerminal(status) ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                Cette facture est en statut final ({invoiceStatusLabel(status)}
                ).
              </p>
            ) : null}

            {showCreditForm && canManageInvoices && canCreateCreditNote(status) ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                <h2 className="mb-3 font-medium">Nouvel avoir</h2>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[200px]" data-form-field="amountTtc">
                    <Label>Montant TTC (optionnel)</Label>
                    <Input
                      type="number"
                      min={0.01}
                      max={invoice.amountDue}
                      step="0.01"
                      placeholder={`Max ${invoice.amountDue}`}
                      value={creditAmount}
                      error={Boolean(creditAmountError)}
                      onChange={(event) => {
                        setCreditAmountError(null);
                        setCreditAmount(
                          event.target.value
                            ? Number(event.target.value)
                            : "",
                        );
                      }}
                    />
                    {creditAmountError ? (
                      <p className="mt-1 text-xs text-red-600">
                        {creditAmountError}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Laissez vide pour un avoir total basé sur les lignes.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void createCreditNote()}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
                <h2 className="mb-3 font-medium">Informations</h2>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Client</dt>
                    <dd className="font-medium">
                      {invoice.client?.companyName ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">BC source</dt>
                    <dd>
                      {invoice.order ? (
                        <Link
                          href={`/commandes/${invoice.order.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {invoice.order.number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Devis source</dt>
                    <dd>
                      {invoice.quotation ? (
                        <Link
                          href={`/devis/${invoice.quotation.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {invoice.quotation.number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Facture d&apos;origine</dt>
                    <dd>
                      {invoice.originalInvoice ? (
                        <Link
                          href={`/factures/${invoice.originalInvoice.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {invoice.originalInvoice.number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Devise</dt>
                    <dd>
                      {invoice.currency}
                      {invoice.exchangeRate && invoice.exchangeRate !== 1
                        ? ` (taux ${invoice.exchangeRate})`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Conditions de paiement</dt>
                    <dd>{invoice.paymentTerm?.name ?? "—"}</dd>
                  </div>
                </dl>
                {invoice.notes ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Mentions :
                    </span>{" "}
                    {invoice.notes}
                  </p>
                ) : null}
                {invoice.internalNotes ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Notes internes :
                    </span>{" "}
                    {invoice.internalNotes}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h2 className="mb-3 font-medium">Totaux</h2>
                <dl className="space-y-2 text-sm">
                  {invoice.subtotalHt != null ? (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Sous-total HT</dt>
                      <dd>{formatMoney(invoice.subtotalHt, invoice.currency)}</dd>
                    </div>
                  ) : null}
                  {discountPct > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">
                        Remise globale ({discountPct}%)
                      </dt>
                      <dd>—</dd>
                    </div>
                  ) : null}
                  {invoice.totalTax != null ? (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">TVA</dt>
                      <dd>{formatMoney(invoice.totalTax, invoice.currency)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total TTC</dt>
                    <dd className="font-medium">
                      {formatMoney(invoice.totalTtc, invoice.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Payé</dt>
                    <dd>{formatMoney(invoice.amountPaid, invoice.currency)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="font-semibold">Reste dû</dt>
                    <dd className="text-lg font-semibold text-brand-600">
                      {formatMoney(invoice.amountDue, invoice.currency)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {canManageInvoices &&
            canRecordInvoicePayment(status, invoice.amountDue) ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-3 font-medium">Enregistrer un paiement</h2>
                <InvoicePaymentForm
                  amountDue={invoice.amountDue}
                  currency={invoice.currency}
                  isSubmitting={isBusy}
                  onSubmit={async (values) => {
                    await runAction({
                      confirm: {
                        title: "Enregistrer le paiement ?",
                        message: `Montant : ${values.amount} ${invoice.currency}`,
                        confirmLabel: "Enregistrer",
                      },
                      loadingMessage: "Enregistrement du paiement...",
                      success: {
                        title: "Paiement enregistré",
                        message: invoice.number,
                      },
                      showResultOnError: false,
                      rethrowOnError: true,
                      action: async () => {
                        await recordPaymentMutation.mutateAsync({
                          id: invoice.id,
                          payload: {
                            amount: values.amount,
                            paymentMethod: values.paymentMethod,
                            ...(values.paymentDate
                              ? { paymentDate: values.paymentDate }
                              : {}),
                            ...(values.reference
                              ? { reference: values.reference }
                              : {}),
                            ...(values.notes ? { notes: values.notes } : {}),
                          },
                        });
                        await invoiceQuery.refetch();
                      },
                    });
                  }}
                />
              </div>
            ) : null}

            {canManageReminders &&
            status &&
            canSendManualReminder(status, invoice.amountDue) ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium">Relance client</h2>
                  <Link
                    href={`/relances/historique?invoiceId=${invoice.id}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Voir l&apos;historique
                  </Link>
                </div>
                {showReminderForm ? (
                  <ManualReminderForm
                    isSubmitting={sendManualMutation.isPending || isBusy}
                    onCancel={() => setShowReminderForm(false)}
                    onSubmit={async (values: ManualReminderFormValues) => {
                      await runAction({
                        confirm: {
                          title: "Envoyer la relance ?",
                          message:
                            "Un message de relance sera envoyé au client selon le canal choisi.",
                          confirmLabel: "Envoyer",
                        },
                        loadingMessage: "Envoi de la relance...",
                        success: {
                          title: "Relance envoyée",
                          message: invoice.number,
                        },
                        showResultOnError: false,
                        rethrowOnError: true,
                        action: async () => {
                          await sendManualMutation.mutateAsync({
                            invoiceId: invoice.id,
                            payload: {
                              message: values.message,
                              channel: values.channel,
                              ...(values.subject?.trim()
                                ? { subject: values.subject.trim() }
                                : {}),
                              ...(values.level ? { level: values.level } : {}),
                            },
                          });
                          setShowReminderForm(false);
                          await invoiceRemindersQuery.refetch();
                        },
                      });
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReminderForm(true)}
                    className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                  >
                    Envoyer une relance manuelle
                  </button>
                )}
              </div>
            ) : null}

            {invoiceReminders.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Relances envoyées</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm">
                    {invoiceReminders.map((reminder) => (
                      <li
                        key={reminder.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <ReminderLevelBadge level={reminder.level} />
                            <span className="text-xs text-gray-500">
                              {reminderTypeLabel(reminder.type)} —{" "}
                              {reminderChannelLabel(reminder.channel)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(reminder.sentAt)}
                            {reminder.subject ? ` — ${reminder.subject}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {payments.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Paiements reçus</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm">
                    {payments.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                      >
                        <div>
                          <p className="font-medium">
                            {formatMoney(payment.amount, invoice.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.paymentDate)} —{" "}
                            {PAYMENT_METHOD_LABELS[payment.paymentMethod] ??
                              payment.paymentMethod}
                            {payment.reference ? ` — ${payment.reference}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {creditNotes.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Avoirs liés</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm">
                    {creditNotes.map((note) => (
                      <li key={note.id}>
                        <Link
                          href={`/factures/${note.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {note.number}
                        </Link>
                        <span className="ml-2 text-gray-500">
                          {formatDate(note.issueDate)} —{" "}
                          {formatMoney(note.totalTtc, invoice.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {lines.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Lignes de la facture</h2>
                </div>
                <div className="p-4">
                  <DataTable<InvoiceLine>
                    data={lines}
                    columns={lineColumns(invoice.currency)}
                    rowKey={(line) => line.id}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <InvoicePdfPreviewModal
        preview={preview}
        invoiceNumber={invoice?.number}
        onClose={closePreview}
      />
    </RequireInvoiceAccess>
  );
}
