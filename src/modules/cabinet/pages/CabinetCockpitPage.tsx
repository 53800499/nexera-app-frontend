"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireCabinetAccess } from "../components/RequireCabinetAccess";
import { LinkedCompaniesTable } from "../components/LinkedCompaniesTable";
import { CABINET_ROUTES } from "../constants/routes";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";

export default function CabinetCockpitPage() {
  const { companiesQuery } = useLinkedCompanies();
  const companies = companiesQuery.data ?? [];
  const preview = companies.slice(0, 5);

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Cockpit cabinet
          </h1>
          <p className="text-sm text-gray-500">
            Vue portefeuille multi-entreprises — dossiers autorisés par vos
            clients.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Dossiers actifs
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-800 dark:text-white/90">
              {companiesQuery.isLoading ? "—" : companies.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Accès
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Les droits (factures, encaissements, clients) sont définis par
              chaque entreprise cliente.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Prochaine étape
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Alertes, révision et liasse fiscale (à venir).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Portefeuille récent
            </h2>
            <Link
              href={CABINET_ROUTES.dossiers}
              className="text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Voir tous les dossiers
            </Link>
          </div>

          {companiesQuery.isLoading ? (
            <LoadingBlock label="Chargement du portefeuille..." />
          ) : companiesQuery.isError ? (
            <ErrorState
              title="Échec du chargement"
              message="Impossible de charger les entreprises liées."
            />
          ) : (
            <LinkedCompaniesTable companies={preview} />
          )}
        </div>
      </div>
    </RequireCabinetAccess>
  );
}
