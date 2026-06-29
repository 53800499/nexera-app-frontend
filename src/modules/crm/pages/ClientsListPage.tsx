"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import Input from "@/components/form/input/InputField";
import { RequireCrmAccess } from "../components/RequireCrmAccess";
import { ClientsTable } from "../components/ClientsTable";
import { useCrmAccess } from "../hooks/useCrmAccess";
import { useClients } from "../hooks/useClients";
import { useCrmSyncStore } from "../offline/store/crmSyncStore";

export default function ClientsListPage() {
  const { canManageClients } = useCrmAccess();
  const isOffline = useCrmSyncStore((state) => state.isOffline);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { clientsQuery } = useClients({ page, limit: 20, q: query || undefined });

  return (
    <RequireCrmAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Clients
            </h1>
            <p className="text-sm text-gray-500">
              Référentiel clients, contacts et historique commercial (CRM).
              {isOffline ? " — données locales (mode hors-ligne)." : ""}
            </p>
          </div>
          {canManageClients ? (
            <Link
              href="/clients/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouveau client
            </Link>
          ) : null}
        </div>

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Rechercher par nom, code, SIRET, IFU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Rechercher
          </button>
        </form>

        {clientsQuery.isPending && !clientsQuery.data && (
          <LoadingBlock label="Chargement des clients..." />
        )}

        {clientsQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des clients."
            onRetry={() => clientsQuery.refetch()}
          />
        )}

        {clientsQuery.data ? (
          <>
            {query ? (
              <p className="text-xs text-gray-500">
                {clientsQuery.data.total} résultat(s) — recherche rapide (max 20
                affichés via GET /clients/search).
              </p>
            ) : null}
            <ClientsTable
              clients={clientsQuery.data.items}
              canManage={canManageClients}
            />
            {!query ? (
              <div className="flex justify-center">
                <Pagination
                  currentPage={clientsQuery.data.page}
                  totalPages={clientsQuery.data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </RequireCrmAccess>
  );
}
