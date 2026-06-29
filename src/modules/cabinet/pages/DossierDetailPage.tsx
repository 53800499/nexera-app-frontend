"use client";

import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequireCabinetAccess } from "../components/RequireCabinetAccess";
import { CompanyInvoicesTable } from "../components/CompanyInvoicesTable";
import { CabinetPermissionBadges } from "../components/CabinetPermissionBadges";
import {
  CABINET_SCOPE_PERMISSIONS,
  hasCabinetScopePermission,
} from "../constants/cabinetPermissionLabels";
import { useCompanyInvoices } from "../hooks/useCompanyInvoices";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";

type Props = {
  companyTenantId: string;
};

export default function DossierDetailPage({ companyTenantId }: Props) {
  const [page, setPage] = useState(1);
  const { companiesQuery } = useLinkedCompanies();
  const company = companiesQuery.data?.find((item) => item.id === companyTenantId);
  const canViewInvoices = hasCabinetScopePermission(
    company?.permissions,
    CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
  );

  const { invoicesQuery } = useCompanyInvoices({
    companyTenantId,
    page,
    limit: 20,
    enabled: canViewInvoices,
  });

  const invoices = invoicesQuery.data?.items ?? [];
  const total = invoicesQuery.data?.total ?? 0;
  const limit = invoicesQuery.data?.limit ?? 20;

  return (
    <RequireCabinetAccess>
      <div className="space-y-4">
        <div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {company?.name ?? "Dossier client"}
          </h1>
          <p className="text-sm text-gray-500">
            Dossier entreprise — consultation selon les droits accordés par le
            client.
          </p>
          {company?.permissions?.length ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Droits accordés sur ce dossier
              </p>
              <CabinetPermissionBadges permissions={company.permissions} />
            </div>
          ) : null}
        </div>

        {!canViewInvoices ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            L&apos;entreprise ne vous a pas autorisé à consulter les factures de
            ce dossier. Contactez votre client pour ajuster les droits dans ses
            paramètres.
          </div>
        ) : invoicesQuery.isLoading ? (
          <LoadingBlock label="Chargement des factures..." />
        ) : invoicesQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger les factures de ce dossier."
          />
        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Factures du dossier
            </h2>
            <CompanyInvoicesTable invoices={invoices} />
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(total / limit))}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </RequireCabinetAccess>
  );
}
