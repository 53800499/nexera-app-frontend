"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequireOrderAccess } from "../components/RequireOrderAccess";
import { OrdersTable } from "../components/OrdersTable";
import { useOrderAccess } from "../hooks/useOrderAccess";
import { useOrders } from "../hooks/useOrders";
import { useOrdersSyncStore } from "../offline/store/ordersSyncStore";
import { ORDER_STATUS_LABELS } from "../utils/orderLabels";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function OrdersListPage() {
  const { canManageOrders } = useOrderAccess();
  const isOffline = useOrdersSyncStore((state) => state.isOffline);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const { ordersQuery } = useOrders({
    page,
    limit: 20,
    q: query || undefined,
    status: status || undefined,
  });

  return (
    <RequireOrderAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Bons de commande
            </h1>
            <p className="text-sm text-gray-500">
              Création, confirmation et facturation des commandes clients.
              {isOffline ? " — données locales (mode hors-ligne)." : ""}
            </p>
          </div>
          {canManageOrders ? (
            <Link
              href="/commandes/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouveau BC
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
          <div className="min-w-[220px] flex-1">
            <Input
              placeholder="Rechercher par n°, client..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Rechercher
          </button>
        </form>

        {ordersQuery.isPending && !ordersQuery.data && (
          <LoadingBlock label="Chargement des commandes..." />
        )}

        {ordersQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des commandes."
            onRetry={() => ordersQuery.refetch()}
          />
        )}

        {ordersQuery.data ? (
          <>
            <OrdersTable
              orders={ordersQuery.data.items}
              canManage={canManageOrders}
            />
            <div className="flex justify-center">
              <Pagination
                currentPage={ordersQuery.data.page}
                totalPages={ordersQuery.data.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequireOrderAccess>
  );
}
