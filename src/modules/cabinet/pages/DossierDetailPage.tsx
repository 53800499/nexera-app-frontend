"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequireCabinetAccess } from "../components/RequireCabinetAccess";
import { CompanyInvoicesTable } from "../components/CompanyInvoicesTable";
import { CompanyPaymentsTable } from "../components/CompanyPaymentsTable";
import { CompanyClientsTable } from "../components/CompanyClientsTable";
import { CabinetPermissionBadges } from "../components/CabinetPermissionBadges";
import {
  CABINET_SCOPE_PERMISSIONS,
  hasCabinetScopePermission,
} from "../constants/cabinetPermissionLabels";
import { CABINET_ROUTES } from "../constants/routes";
import { useCompanyInvoices } from "../hooks/useCompanyInvoices";
import { useCompanyPayments } from "../hooks/useCompanyPayments";
import { useCompanyClients } from "../hooks/useCompanyClients";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";

type Props = {
  companyTenantId: string;
};

type TabKey = "invoices" | "payments" | "clients";

export default function DossierDetailPage({ companyTenantId }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("invoices");
  const [page, setPage] = useState(1);
  const { companiesQuery } = useLinkedCompanies();
  const company = companiesQuery.data?.find((item) => item.id === companyTenantId);

  const canViewInvoices = hasCabinetScopePermission(
    company?.permissions,
    CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
  );
  const canViewPayments = hasCabinetScopePermission(
    company?.permissions,
    CABINET_SCOPE_PERMISSIONS.PAYMENTS_READ,
  );
  const canViewClients = hasCabinetScopePermission(
    company?.permissions,
    CABINET_SCOPE_PERMISSIONS.CLIENTS_READ,
  );

  useEffect(() => {
    if (!company) return;
    if (activeTab === "invoices" && !canViewInvoices) {
      if (canViewPayments) setActiveTab("payments");
      else if (canViewClients) setActiveTab("clients");
    }
  }, [company, canViewInvoices, canViewPayments, canViewClients, activeTab]);

  const { invoicesQuery } = useCompanyInvoices({
    companyTenantId,
    page,
    limit: 20,
    enabled: activeTab === "invoices" && canViewInvoices,
  });

  const { paymentsQuery } = useCompanyPayments({
    companyTenantId,
    page,
    limit: 20,
    enabled: activeTab === "payments" && canViewPayments,
  });

  const { clientsQuery } = useCompanyClients({
    companyTenantId,
    page,
    limit: 20,
    enabled: activeTab === "clients" && canViewClients,
  });

  const invoices = invoicesQuery.data?.items ?? [];
  const invoicesTotal = invoicesQuery.data?.total ?? 0;
  const invoicesLimit = invoicesQuery.data?.limit ?? 20;

  const payments = paymentsQuery.data?.items ?? [];
  const paymentsTotal = paymentsQuery.data?.total ?? 0;
  const paymentsLimit = paymentsQuery.data?.limit ?? 20;

  const clients = clientsQuery.data?.items ?? [];
  const clientsTotal = clientsQuery.data?.total ?? 0;
  const clientsLimit = clientsQuery.data?.limit ?? 20;

  const tabs: { key: TabKey; label: string; allowed: boolean }[] = [
    {
      key: "invoices",
      label: "Factures",
      allowed: canViewInvoices,
    },
    {
      key: "payments",
      label: "Encaissements",
      allowed: canViewPayments,
    },
    {
      key: "clients",
      label: "Clients",
      allowed: canViewClients,
    },
  ];

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div>
          <Link
            href={CABINET_ROUTES.dossiers}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Retour aux dossiers clients
          </Link>
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

        {/* Onglets de navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.allowed ? (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                      title="Autorisé"
                    />
                  ) : (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"
                      title="Non autorisé"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu Factures */}
        {activeTab === "invoices" ? (
          !canViewInvoices ? (
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  Factures du dossier ({invoicesTotal})
                </h2>
              </div>
              <CompanyInvoicesTable invoices={invoices} />
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(invoicesTotal / invoicesLimit))}
                onPageChange={setPage}
              />
            </>
          )
        ) : null}

        {/* Contenu Encaissements */}
        {activeTab === "payments" ? (
          !canViewPayments ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              L&apos;entreprise ne vous a pas autorisé à consulter les encaissements de
              ce dossier. Contactez votre client pour ajuster les droits dans ses
              paramètres.
            </div>
          ) : paymentsQuery.isLoading ? (
            <LoadingBlock label="Chargement des encaissements..." />
          ) : paymentsQuery.isError ? (
            <ErrorState
              title="Échec du chargement"
              message="Impossible de charger les encaissements de ce dossier."
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  Encaissements du dossier ({paymentsTotal})
                </h2>
              </div>
              <CompanyPaymentsTable payments={payments} />
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(paymentsTotal / paymentsLimit))}
                onPageChange={setPage}
              />
            </>
          )
        ) : null}

        {/* Contenu Clients */}
        {activeTab === "clients" ? (
          !canViewClients ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              L&apos;entreprise ne vous a pas autorisé à consulter le référentiel clients de
              ce dossier. Contactez votre client pour ajuster les droits dans ses
              paramètres.
            </div>
          ) : clientsQuery.isLoading ? (
            <LoadingBlock label="Chargement des clients..." />
          ) : clientsQuery.isError ? (
            <ErrorState
              title="Échec du chargement"
              message="Impossible de charger le référentiel clients de ce dossier."
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  Référentiel clients du dossier ({clientsTotal})
                </h2>
              </div>
              <CompanyClientsTable clients={clients} />
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(clientsTotal / clientsLimit))}
                onPageChange={setPage}
              />
            </>
          )
        ) : null}
      </div>
    </RequireCabinetAccess>
  );
}
