"use client";

import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useClients } from "@/modules/crm/hooks/useClients";
import type { ClientSummary } from "@/modules/crm/types/client.types";
import { LoadingBlock } from "@/shared/components/feedback";
import { useClientPaymentBehavior } from "../hooks/useReminders";

export function PaymentBehaviorPanel() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const { clientsQuery } = useClients({ q: query || undefined, limit: 8 });
  const clients = clientsQuery.data?.items ?? [];
  const behaviorQuery = useClientPaymentBehavior(clientId);

  useEffect(() => {
    if (!clientId || query) return;
    const selected = clients.find((client) => client.id === clientId);
    if (selected) {
      setSearch(`${selected.code} — ${selected.companyName}`);
    }
  }, [clientId, clients, query]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 font-medium">Analyse comportement de paiement</h2>
      <p className="mb-4 text-sm text-gray-500">
        Suggestions IA pour ajuster les délais de relance selon l&apos;historique client.
      </p>

      <div className="relative mb-4">
        <Label>Client</Label>
        <Input
          value={search}
          placeholder="Rechercher un client..."
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery(event.target.value.trim());
            setOpen(true);
          }}
        />
        {open && clients.length > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {clients.map((client: ClientSummary) => (
              <li key={client.id}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onMouseDown={() => {
                    setClientId(client.id);
                    setSearch(`${client.code} — ${client.companyName}`);
                    setOpen(false);
                  }}
                >
                  {client.companyName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {behaviorQuery.isFetching && clientId ? (
        <LoadingBlock label="Analyse en cours..." />
      ) : null}

      {behaviorQuery.data ? (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Délai moyen de paiement</dt>
            <dd>{behaviorQuery.data.avgDaysToPay.toFixed(1)} jours</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Taux de paiement à temps</dt>
            <dd>{(behaviorQuery.data.onTimePaymentRate * 100).toFixed(0)} %</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Factures analysées</dt>
            <dd>{behaviorQuery.data.paidInvoicesAnalyzed}</dd>
          </div>
          {behaviorQuery.data.suggestions.length > 0 ? (
            <div className="pt-2">
              <dt className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Suggestions
              </dt>
              <ul className="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-400">
                {behaviorQuery.data.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
