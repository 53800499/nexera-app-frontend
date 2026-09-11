"use client";

import type { CabinetCompanyClient } from "../types/cabinet.types";

type Props = {
  clients: CabinetCompanyClient[];
};

export function CompanyClientsTable({ clients }: Props) {
  if (clients.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucun client enregistré pour ce dossier.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Raison sociale
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Contact principal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              SIRET / N° Fiscal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Documents
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {clients.map((client) => {
            const primaryContact = client.contacts?.[0];
            const invoiceCount = client._count?.invoices ?? 0;
            const paymentCount = client._count?.payments ?? 0;

            return (
              <tr key={client.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                  {client.code}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {client.companyName}
                  </p>
                  {client.tradeName ? (
                    <p className="text-xs text-gray-500">{client.tradeName}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {client.clientType === "individual" ? "Particulier" : "Entreprise"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {primaryContact ? (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        {primaryContact.firstName} {primaryContact.lastName}
                      </p>
                      {primaryContact.email ? (
                        <p className="text-xs text-gray-400">{primaryContact.email}</p>
                      ) : primaryContact.phone ? (
                        <p className="text-xs text-gray-400">{primaryContact.phone}</p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {client.siret || client.taxId || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {invoiceCount} fact.
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {paymentCount} règ.
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {client.isArchived ? (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Archivé
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Actif
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
