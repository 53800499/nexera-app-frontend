"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequirePaymentAccess } from "../components/RequirePaymentAccess";
import { PaymentsTable } from "../components/PaymentsTable";
import { usePaymentAccess } from "../hooks/usePaymentAccess";
import { usePayments } from "../hooks/usePayments";

export default function PaymentsListPage() {
  const { canManagePayments } = usePaymentAccess();
  const [page, setPage] = useState(1);
  const [includeCancelled, setIncludeCancelled] = useState(false);

  const { paymentsQuery } = usePayments({
    page,
    limit: 20,
    includeCancelled,
  });

  return (
    <RequirePaymentAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Encaissements
            </h1>
            <p className="text-sm text-gray-500">
              Suivi des paiements clients et imputations sur factures (UC-06).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/encaissements/balance-agee"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Balance âgée
            </Link>
            {canManagePayments ? (
              <Link
                href="/encaissements/nouveau"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Nouveau paiement
              </Link>
            ) : null}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={includeCancelled}
            onChange={(event) => {
              setIncludeCancelled(event.target.checked);
              setPage(1);
            }}
            className="rounded border-gray-300"
          />
          Inclure les encaissements annulés
        </label>

        {paymentsQuery.isPending && !paymentsQuery.data && (
          <LoadingBlock label="Chargement des encaissements..." />
        )}

        {paymentsQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des encaissements."
            onRetry={() => paymentsQuery.refetch()}
          />
        )}

        {paymentsQuery.data ? (
          <>
            <PaymentsTable payments={paymentsQuery.data.items} />
            <div className="flex justify-center">
              <Pagination
                currentPage={paymentsQuery.data.page}
                totalPages={paymentsQuery.data.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequirePaymentAccess>
  );
}
