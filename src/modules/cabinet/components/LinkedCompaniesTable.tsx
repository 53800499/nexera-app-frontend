"use client";

import Link from "next/link";
import type { LinkedCompany } from "../types/cabinet.types";
import { CABINET_ROUTES } from "../constants/routes";
import { CabinetPermissionBadges } from "./CabinetPermissionBadges";
import {
  CABINET_SCOPE_PERMISSIONS,
  hasCabinetScopePermission,
} from "../constants/cabinetPermissionLabels";

type Props = {
  companies: LinkedCompany[];
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LinkedCompaniesTable({ companies }: Props) {
  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900/40">
        <p className="text-sm font-medium text-gray-700 dark:text-white/80">
          Aucun dossier client lié
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Les entreprises clientes doivent autoriser votre cabinet depuis{" "}
          <strong>Paramètres → Cabinet comptable</strong> en saisissant votre
          code d&apos;invitation.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Entreprise cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Autorisé depuis le
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Droits accordés
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {companies.map((company) => {
            const canViewInvoices = hasCabinetScopePermission(
              company.permissions,
              CABINET_SCOPE_PERMISSIONS.INVOICES_READ,
            );

            return (
              <tr key={company.id}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {company.name}
                  </p>
                  <p className="text-xs text-gray-500">Dossier entreprise</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(company.linkedAt)}
                </td>
                <td className="px-4 py-3">
                  <CabinetPermissionBadges
                    permissions={company.permissions}
                    compact
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {canViewInvoices ? (
                    <Link
                      href={CABINET_ROUTES.dossier(company.id)}
                      className="text-sm font-medium text-brand-500 hover:text-brand-600"
                    >
                      Consulter les factures
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Factures non autorisées
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
