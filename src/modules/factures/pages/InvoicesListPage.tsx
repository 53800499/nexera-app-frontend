"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/table";
import { RequireInvoiceAccess } from "../components/RequireInvoiceAccess";
import { InvoicesTable } from "../components/InvoicesTable";
import { useInvoiceAccess } from "../hooks/useInvoiceAccess";
import { useInvoices } from "../hooks/useInvoices";
import { useInvoicesSyncStore } from "../offline/store/invoicesSyncStore";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
} from "../utils/invoiceLabels";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tous les types" },
  ...Object.entries(INVOICE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function InvoicesListPage() {
  const { canManageInvoices } = useInvoiceAccess();
  const isOffline = useInvoicesSyncStore((state) => state.isOffline);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [invoiceType, setInvoiceType] = useState("");

  const { invoicesQuery } = useInvoices({
    page,
    limit: 20,
    q: query || undefined,
    status: status || undefined,
    invoiceType: invoiceType || undefined,
  });

  return (
    <RequireInvoiceAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Factures
            </h1>
            <p className="text-sm text-gray-500">
              Émission, envoi et suivi des factures commerciales (UC-05).
              {isOffline ? " — données locales (mode hors-ligne)." : ""}
            </p>
          </div>
          {canManageInvoices ? (
            <Link
              href="/factures/nouvelle"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouvelle facture
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
                <option key={option.value || "all-status"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={invoiceType}
              onChange={(event) => {
                setInvoiceType(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {TYPE_FILTERS.map((option) => (
                <option key={option.value || "all-type"} value={option.value}>
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

        {invoicesQuery.isPending && !invoicesQuery.data && (
          <LoadingBlock label="Chargement des factures..." />
        )}

        {invoicesQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des factures."
            onRetry={() => invoicesQuery.refetch()}
          />
        )}

        {invoicesQuery.data ? (
          <>
            <InvoicesTable
              invoices={invoicesQuery.data.items}
              canManage={canManageInvoices}
            />
            <div className="flex justify-center">
              <Pagination
                currentPage={invoicesQuery.data.page}
                totalPages={invoicesQuery.data.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequireInvoiceAccess>
  );
}
