"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequireReminderAccess } from "../components/RequireReminderAccess";
import { RemindersTable } from "../components/RemindersTable";
import { useReminders } from "../hooks/useReminders";

type Props = {
  defaultClientId?: string;
  defaultInvoiceId?: string;
};

export default function RemindersHistoryPage({
  defaultClientId,
  defaultInvoiceId,
}: Props) {
  const [page, setPage] = useState(1);
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId ?? "");
  const [clientQuery, setClientQuery] = useState(defaultClientId ?? "");
  const [invoiceQuery, setInvoiceQuery] = useState(defaultInvoiceId ?? "");

  const { remindersQuery } = useReminders({
    page,
    limit: 20,
    clientId: clientQuery || undefined,
    invoiceId: invoiceQuery || undefined,
  });

  return (
    <RequireReminderAccess>
      <div className="space-y-4">
        <Link
          href="/relances"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux relances
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Historique des relances
          </h1>
          <p className="text-sm text-gray-500">
            Traçabilité des relances automatiques et manuelles.
          </p>
        </div>

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setClientQuery(clientId.trim());
            setInvoiceQuery(invoiceId.trim());
          }}
        >
          <div className="min-w-[200px] flex-1">
            <Input
              placeholder="Filtrer par ID client (UUID)"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <Input
              placeholder="Filtrer par ID facture (UUID)"
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Filtrer
          </button>
        </form>

        {remindersQuery.isPending && !remindersQuery.data && (
          <LoadingBlock label="Chargement de l'historique..." />
        )}

        {remindersQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger l'historique des relances."
            onRetry={() => remindersQuery.refetch()}
          />
        )}

        {remindersQuery.data ? (
          <>
            <RemindersTable reminders={remindersQuery.data.items} />
            <div className="flex justify-center">
              <Pagination
                currentPage={remindersQuery.data.page}
                totalPages={remindersQuery.data.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequireReminderAccess>
  );
}
