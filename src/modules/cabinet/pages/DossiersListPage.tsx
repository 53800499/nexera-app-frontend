"use client";

import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireCabinetAccess } from "../components/RequireCabinetAccess";
import { LinkedCompaniesTable } from "../components/LinkedCompaniesTable";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";

export default function DossiersListPage() {
  const { companiesQuery } = useLinkedCompanies();

  return (
    <RequireCabinetAccess>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Dossiers clients
          </h1>
          <p className="text-sm text-gray-500">
            Entreprises ayant autorisé l&apos;accès de votre cabinet comptable.
          </p>
        </div>

        {companiesQuery.isLoading ? (
          <LoadingBlock label="Chargement des dossiers..." />
        ) : companiesQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des dossiers."
          />
        ) : (
          <LinkedCompaniesTable companies={companiesQuery.data ?? []} />
        )}
      </div>
    </RequireCabinetAccess>
  );
}
