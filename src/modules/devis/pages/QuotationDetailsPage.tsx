"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
} from "@/shared/components/feedback";
import { QuotationPdfPreviewModal } from "../components/QuotationPdfPreviewModal";
import { RequireQuotationAccess } from "../components/RequireQuotationAccess";
import { QuotationStatusBadge } from "../components/QuotationStatusBadge";
import { useQuotationAccess } from "../hooks/useQuotationAccess";
import { useQuotation, useQuotations } from "../hooks/useQuotations";
import { useQuotationPdf } from "../pdf/useQuotationPdf";
import type { QuotationLine } from "../types/quotation.types";
import { formatMoney } from "../utils/quotationCalculations";
import {
  normalizeQuotationStatus,
  quotationStatusLabel,
} from "../utils/quotationLabels";
import {
  canConvertQuotation,
  canDecideQuotation,
  canDeleteQuotation,
  canEditQuotation,
  canMarkQuotationViewed,
  canSendQuotation,
  isQuotationTerminal,
} from "../utils/quotationStatusRules";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

const lineColumns = (
  currency: string,
): DataTableColumn<QuotationLine>[] => [
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
    render: (line) => `${line.taxRate?.rate ?? line.taxRatePct ?? 0}%`,
  },
  {
    key: "total",
    header: "Total TTC",
    render: (line) => formatMoney(line.lineTotalTtc, currency),
  },
];

export default function QuotationDetailsPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const { canManageQuotations } = useQuotationAccess();
  const { preview, openPreview, downloadPdf, closePreview } =
    useQuotationPdf();
  const quotationQuery = useQuotation(id);
  const {
    removeMutation,
    sendMutation,
    changeStatusMutation,
    convertMutation,
  } = useQuotations();

  const quotation = quotationQuery.data;
  const status = quotation
    ? normalizeQuotationStatus(quotation.status)
    : null;
  const discountPct = quotation?.discountPct ?? 0;

  const handlePreview = () => {
    if (!quotation) return;
    void runAction({
      loadingMessage: "Génération de l'aperçu...",
      error: { title: "Aperçu impossible" },
      action: () => openPreview(quotation),
    });
  };

  const handleDownloadPdf = () => {
    if (!quotation) return;
    void runAction({
      loadingMessage: "Génération du PDF...",
      success: { title: "PDF téléchargé" },
      error: { title: "Génération PDF impossible" },
      action: () => downloadPdf(quotation),
    });
  };

  return (
    <RequireQuotationAccess>
      <div className="space-y-4">
        <Link
          href="/devis"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux devis
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

        {quotation && status ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {quotation.number}
                  </h1>
                  <QuotationStatusBadge status={status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {quotation.client?.companyName ?? "Client"} — émis le{" "}
                  {formatDate(quotation.issueDate)}
                </p>
              </div>

              {canManageQuotations ? (
                <div className="flex flex-wrap gap-2">
                  {canEditQuotation(status) ? (
                    <Link
                      href={`/devis/${quotation.id}/modifier`}
                      className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
                    >
                      Modifier
                    </Link>
                  ) : null}
                  {canSendQuotation(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Marquer le devis comme envoyé ?",
                            message:
                              "Le statut passera à « envoyé ». Cette action est irréversible.",
                            confirmLabel: "Marquer envoyé",
                          },
                          loadingMessage: "Mise à jour du devis...",
                          success: {
                            title: "Devis envoyé",
                            message: quotation.number,
                          },
                          error: {
                            title: "Envoi impossible",
                            message:
                              "Vérifiez le statut du devis, l'e-mail du client et la configuration d'envoi dans Paramètres.",
                          },
                          action: async () => {
                            const result = await sendMutation.mutateAsync({
                              id: quotation.id,
                            });
                            await quotationQuery.refetch();
                            return result.quotation;
                          },
                        })
                      }
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Marquer envoyé
                    </button>
                  ) : null}
                  {canMarkQuotationViewed(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Marquer comme vu ?",
                            message:
                              "Le devis sera enregistré comme consulté par le client.",
                            confirmLabel: "Confirmer",
                          },
                          loadingMessage: "Mise à jour du devis...",
                          success: {
                            title: "Devis marqué comme vu",
                            message: quotation.number,
                          },
                          action: async () => {
                            const updated = await changeStatusMutation.mutateAsync({
                              id: quotation.id,
                              payload: { status: "viewed" },
                            });
                            await quotationQuery.refetch();
                            return updated;
                          },
                        })
                      }
                      className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      Marquer comme vu
                    </button>
                  ) : null}
                  {canDecideQuotation(status) ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Accepter ce devis ?",
                              message:
                                "Le devis sera marqué comme accepté par le client.",
                              confirmLabel: "Accepter",
                            },
                            loadingMessage: "Mise à jour du devis...",
                            success: {
                              title: "Devis accepté",
                              message: quotation.number,
                            },
                            action: async () => {
                              const updated =
                                await changeStatusMutation.mutateAsync({
                                  id: quotation.id,
                                  payload: { status: "accepted" },
                                });
                              await quotationQuery.refetch();
                              return updated;
                            },
                          })
                        }
                        className="rounded-lg border border-green-300 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Refuser ce devis ?",
                              message:
                                "Le devis sera marqué comme refusé par le client.",
                              confirmLabel: "Refuser",
                              variant: "warning",
                            },
                            loadingMessage: "Mise à jour du devis...",
                            success: {
                              title: "Devis refusé",
                              message: quotation.number,
                            },
                            action: async () => {
                              const updated =
                                await changeStatusMutation.mutateAsync({
                                  id: quotation.id,
                                  payload: { status: "declined" },
                                });
                              await quotationQuery.refetch();
                              return updated;
                            },
                          })
                        }
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Refuser
                      </button>
                    </>
                  ) : null}
                  {canConvertQuotation(status) ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Convertir en bon de commande ?",
                              message:
                                "Un bon de commande sera créé à partir de ce devis.",
                              confirmLabel: "Convertir",
                            },
                            loadingMessage: "Conversion en cours...",
                            success: {
                              title: "Bon de commande créé",
                              message: quotation.number,
                            },
                            redirectTo: (result) =>
                              `/commandes/${result.targetId}`,
                            redirectMessage: "Ouverture du bon de commande...",
                            error: {
                              title: "Conversion impossible",
                            },
                            action: () =>
                              convertMutation.mutateAsync({
                                id: quotation.id,
                                payload: { target: "order" },
                              }),
                          })
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Convertir en BC
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Convertir en facture ?",
                              message:
                                "Une facture sera créée à partir de ce devis.",
                              confirmLabel: "Convertir",
                            },
                            loadingMessage: "Conversion en cours...",
                            success: {
                              title: "Facture créée",
                              message: quotation.number,
                            },
                            redirectTo: (result) =>
                              `/factures/${result.targetId}`,
                            redirectMessage: "Ouverture de la facture...",
                            error: {
                              title: "Conversion impossible",
                            },
                            action: () =>
                              convertMutation.mutateAsync({
                                id: quotation.id,
                                payload: { target: "invoice" },
                              }),
                          })
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Convertir en facture
                      </button>
                    </>
                  ) : null}
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
                  {canDeleteQuotation(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Supprimer ce brouillon ?",
                            message:
                              "Ce devis sera définitivement supprimé.",
                            confirmLabel: "Supprimer",
                            variant: "danger",
                          },
                          loadingMessage: "Suppression en cours...",
                          success: { title: "Devis supprimé" },
                          redirectTo: "/devis",
                          redirectMessage: "Retour à la liste des devis...",
                          error: {
                            title: "Suppression impossible",
                          },
                          action: () =>
                            removeMutation.mutateAsync(quotation.id),
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

            {isQuotationTerminal(status) ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                Ce devis est en statut final ({quotationStatusLabel(status)}).
                Aucune autre transition de statut n&apos;est possible.
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
                <h2 className="mb-3 font-medium">Informations</h2>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Client</dt>
                    <dd className="font-medium">
                      {quotation.client?.companyName ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Validité</dt>
                    <dd>
                      {quotation.expiryDate
                        ? formatDate(quotation.expiryDate)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Devise</dt>
                    <dd>{quotation.currency}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Conditions de paiement</dt>
                    <dd>{quotation.paymentTerm?.name ?? "—"}</dd>
                  </div>
                </dl>
                {quotation.notes ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Notes :
                    </span>{" "}
                    {quotation.notes}
                  </p>
                ) : null}
                {quotation.internalNotes ? (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Notes internes :
                    </span>{" "}
                    {quotation.internalNotes}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h2 className="mb-3 font-medium">Totaux</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Sous-total HT</dt>
                    <dd>
                      {formatMoney(quotation.subtotalHt, quotation.currency)}
                    </dd>
                  </div>
                  {discountPct > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">
                        Remise globale ({discountPct}%)
                      </dt>
                      <dd>—</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">TVA</dt>
                    <dd>
                      {formatMoney(quotation.totalTax, quotation.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="font-semibold">Total TTC</dt>
                    <dd className="text-lg font-semibold text-brand-600">
                      {formatMoney(quotation.totalTtc, quotation.currency)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                <h2 className="font-medium">Lignes du devis</h2>
              </div>
              <div className="p-4">
                <DataTable<QuotationLine>
                  data={quotation.lines}
                  columns={lineColumns(quotation.currency)}
                  rowKey={(line) => line.id}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
      <QuotationPdfPreviewModal
        preview={preview}
        quotationNumber={quotation?.number}
        onClose={closePreview}
      />
    </RequireQuotationAccess>
  );
}
