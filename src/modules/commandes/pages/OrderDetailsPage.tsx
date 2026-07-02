"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { formatMoney } from "@/modules/devis/utils/quotationCalculations";
import { RequireOrderAccess } from "../components/RequireOrderAccess";
import { OrderBillingPanel } from "../components/OrderBillingPanel";
import { OrderInvoiceForm } from "../components/OrderInvoiceForm";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useOrderAccess } from "../hooks/useOrderAccess";
import { useOrder, useOrders } from "../hooks/useOrders";
import type { OrderDetail, OrderLine } from "../types/order.types";
import { normalizeOrderStatus, orderStatusLabel } from "../utils/orderLabels";
import {
  canCancelOrder,
  canConfirmOrder,
  canCreateOrderInvoice,
  canDeleteOrder,
  canEditOrder,
  isOrderTerminal,
} from "../utils/orderStatusRules";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

const lineColumns = (currency: string): DataTableColumn<OrderLine>[] => [
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

export default function OrderDetailsPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageOrders } = useOrderAccess();
  const orderQuery = useOrder(id);
  const {
    removeMutation,
    confirmMutation,
    cancelMutation,
    createInvoiceMutation,
  } = useOrders();

  const order = orderQuery.data;
  const status = order ? normalizeOrderStatus(order.status) : null;
  const discountPct = order?.discountPct ?? 0;

  const createInvoice = async (
    payload: Parameters<typeof createInvoiceMutation.mutateAsync>[0]["payload"],
  ) => {
    await runAction({
      confirm: {
        title: "Créer la facture ?",
        message: "Une facture sera générée à partir de ce bon de commande.",
        confirmLabel: "Créer la facture",
      },
      loadingMessage: "Création de la facture...",
      success: {
        title: "Facture créée",
        message: order?.number,
      },
      redirectTo: (result) => `/factures/${result.invoice.id}`,
      redirectMessage: "Ouverture de la facture...",
      showResultOnError: false,
      rethrowOnError: true,
      action: async () => {
        const result = await createInvoiceMutation.mutateAsync({ id, payload });
        await orderQuery.refetch();
        return result;
      },
    });
  };

  return (
    <RequireOrderAccess>
      <div className="space-y-4">
        <Link
          href="/commandes"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux commandes
        </Link>

        {orderQuery.isPending && !orderQuery.data && (
          <LoadingBlock label="Chargement du bon de commande..." />
        )}

        {orderQuery.isError && (
          <ErrorState
            title="BC introuvable"
            message="Impossible de charger ce bon de commande."
            onRetry={() => orderQuery.refetch()}
          />
        )}

        {order && status ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {order.number}
                  </h1>
                  <OrderStatusBadge status={status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {order.client?.companyName ?? "Client"} — émis le{" "}
                  {formatDate(order.issueDate)}
                </p>
              </div>

              {canManageOrders ? (
                <div className="flex flex-wrap gap-2">
                  {canEditOrder(status) ? (
                    <Link
                      href={`/commandes/${order.id}/modifier`}
                      className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
                    >
                      Modifier
                    </Link>
                  ) : null}
                  {canConfirmOrder(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Confirmer ce bon de commande ?",
                            message:
                              "Le BC passera au statut confirmé. Cette action est irréversible.",
                            confirmLabel: "Confirmer",
                          },
                          loadingMessage: "Confirmation en cours...",
                          success: {
                            title: "BC confirmé",
                            message: order.number,
                          },
                          action: async () => {
                            const updated = await confirmMutation.mutateAsync(
                              order.id,
                            );
                            await orderQuery.refetch();
                            return updated;
                          },
                        })
                      }
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Confirmer
                    </button>
                  ) : null}
                  {canCancelOrder(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Annuler ce bon de commande ?",
                            message:
                              "Cette action est irréversible.",
                            confirmLabel: "Annuler le BC",
                            variant: "danger",
                          },
                          loadingMessage: "Annulation en cours...",
                          success: {
                            title: "BC annulé",
                            message: order.number,
                          },
                          error: {
                            title: "Annulation impossible",
                          },
                          action: async () => {
                            const updated = await cancelMutation.mutateAsync(
                              order.id,
                            );
                            await orderQuery.refetch();
                            return updated;
                          },
                        })
                      }
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Annuler
                    </button>
                  ) : null}
                  {canDeleteOrder(status) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Supprimer ce brouillon ?",
                            message:
                              "Ce bon de commande sera définitivement supprimé.",
                            confirmLabel: "Supprimer",
                            variant: "danger",
                          },
                          loadingMessage: "Suppression en cours...",
                          success: { title: "BC supprimé" },
                          redirectTo: "/commandes",
                          redirectMessage: "Retour à la liste des commandes...",
                          error: {
                            title: "Suppression impossible",
                          },
                          action: () => removeMutation.mutateAsync(order.id),
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

            {isOrderTerminal(status) ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                Ce bon de commande est en statut final ({orderStatusLabel(status)}
                ). Aucune autre transition n&apos;est possible.
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
                <h2 className="mb-3 font-medium">Informations</h2>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Client</dt>
                    <dd className="font-medium">
                      {order.client?.companyName ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Devis source</dt>
                    <dd>
                      {order.quotation ? (
                        <Link
                          href={`/devis/${order.quotation.id}`}
                          className="text-brand-600 hover:underline"
                        >
                          {order.quotation.number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Date</dt>
                    <dd>{formatDate(order.issueDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Devise</dt>
                    <dd>{order.currency}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h2 className="mb-3 font-medium">Totaux</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Sous-total HT</dt>
                    <dd>{formatMoney(order.subtotalHt, order.currency)}</dd>
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
                    <dd>{formatMoney(order.totalTax, order.currency)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="font-semibold">Total TTC</dt>
                    <dd className="text-lg font-semibold text-brand-600">
                      {formatMoney(order.totalTtc, order.currency)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <OrderBillingPanel billing={order.billing} currency={order.currency} />

            {canManageOrders &&
            canCreateOrderInvoice(status) &&
            !order.billing.isFullyBilled ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-3 font-medium">Nouvelle facture</h2>
                <OrderInvoiceForm
                  currency={order.currency}
                  remainingTtc={order.billing.remainingToInvoice}
                  isSubmitting={isBusy}
                  onSubmit={createInvoice}
                />
              </div>
            ) : null}

            {order.invoices.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                  <h2 className="font-medium">Factures liées</h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm">
                    {order.invoices.map((invoice) => (
                      <li
                        key={invoice.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
                      >
                        <div>
                          <Link
                            href={`/factures/${invoice.id}`}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {invoice.number}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {formatDate(invoice.issueDate)} — {invoice.status}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatMoney(invoice.totalTtc, order.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                <h2 className="font-medium">Lignes du BC</h2>
              </div>
              <div className="p-4">
                <DataTable<OrderLine>
                  data={order.lines}
                  columns={lineColumns(order.currency)}
                  rowKey={(line) => line.id}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </RequireOrderAccess>
  );
}
