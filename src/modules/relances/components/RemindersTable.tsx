"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { ReminderSummary } from "../types/reminder.types";
import { ReminderLevelBadge } from "./ReminderLevelBadge";
import {
  reminderChannelLabel,
  reminderTypeLabel,
} from "../utils/reminderLabels";

type Props = {
  reminders: ReminderSummary[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RemindersTable({ reminders }: Props) {
  const columns: DataTableColumn<ReminderSummary>[] = [
    {
      key: "date",
      header: "Envoyée le",
      render: (row) => formatDate(row.sentAt),
    },
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.clientName ?? "—"}</p>
          <Link
            href={`/clients/${row.clientId}`}
            className="text-xs text-brand-600 hover:underline"
          >
            Voir fiche
          </Link>
        </div>
      ),
    },
    {
      key: "invoice",
      header: "Facture",
      render: (row) => (
        <Link
          href={`/factures/${row.invoiceId}`}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          {row.invoiceNumber ?? row.invoiceId.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: "level",
      header: "Niveau",
      render: (row) => <ReminderLevelBadge level={row.level} />,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => reminderTypeLabel(row.type),
    },
    {
      key: "channel",
      header: "Canal",
      render: (row) => reminderChannelLabel(row.channel),
    },
    {
      key: "subject",
      header: "Objet",
      render: (row) => row.subject ?? "—",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <DataTable<ReminderSummary>
            data={reminders}
            columns={columns}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="Aucune relance"
                description="Les relances automatiques et manuelles apparaîtront ici."
                className="border-0 bg-transparent py-8"
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
