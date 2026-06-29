"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { ClientSummary } from "../types/client.types";
import { ClientStatusBadge } from "./ClientStatusBadge";

type Props = {
  clients: ClientSummary[];
  canManage: boolean;
};

function primaryContact(client: ClientSummary) {
  return (
    client.contacts.find((c) => c.isPrimary) ?? client.contacts[0] ?? null
  );
}

export function ClientsTable({ clients, canManage }: Props) {
  const columns: DataTableColumn<ClientSummary>[] = [
    {
      key: "client",
      header: "Client",
      render: (client) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {client.companyName}
          </p>
          <p className="text-xs text-gray-500">{client.code}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (client) => {
        const contact = primaryContact(client);
        if (!contact) return "—";
        return (
          <div>
            <p className="text-sm">
              {contact.firstName} {contact.lastName}
            </p>
            <p className="text-xs text-gray-500">{contact.email ?? "—"}</p>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (client) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {client.clientType === "company" ? "Entreprise" : "Particulier"}
        </span>
      ),
    },
    {
      key: "activity",
      header: "Activité",
      render: (client) => (
        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
          <span>{client._count?.quotations ?? 0} devis</span>
          <span>·</span>
          <span>{client._count?.invoices ?? 0} factures</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (client) => <ClientStatusBadge isArchived={client.isArchived} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (client) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Fiche
          </Link>
          {canManage && !client.isArchived ? (
            <Link
              href={`/clients/${client.id}/modifier`}
              className="rounded border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
            >
              Modifier
            </Link>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <DataTable<ClientSummary>
            data={clients}
            columns={columns}
            rowKey={(client) => client.id}
            emptyState={
              <EmptyState
                title="Aucun client"
                description="Créez votre premier client pour démarrer le cycle commercial."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/clients/nouveau"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Nouveau client
                    </Link>
                  ) : undefined
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
