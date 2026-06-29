"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import {
  AgedBalancePanel,
  useCommercialDashboard,
} from "@/modules/dashboard";
import { RequirePaymentAccess } from "../components/RequirePaymentAccess";

export default function AgedBalancePage() {
  const dashboardQuery = useCommercialDashboard();
  const dashboard = dashboardQuery.data;

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

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Balance âgée
          </h1>
          <p className="text-sm text-gray-500">
            Répartition des impayés par tranche d&apos;ancienneté.
          </p>
        </div>

        {dashboardQuery.isPending && !dashboardQuery.data && (
          <LoadingBlock label="Chargement de la balance âgée..." />
        )}

        {dashboardQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la balance âgée."
            onRetry={() => dashboardQuery.refetch()}
          />
        )}

        {dashboard ? (
          <AgedBalancePanel
            buckets={dashboard.agedBalance}
            totalOverdueAmountTtc={dashboard.totalOverdueAmountTtc}
          />
        ) : null}
      </div>
    </RequirePaymentAccess>
  );
}
