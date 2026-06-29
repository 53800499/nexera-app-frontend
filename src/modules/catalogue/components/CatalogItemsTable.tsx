"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { CatalogItem } from "../types/catalogue.types";
import { formatPriceHt, ITEM_TYPE_LABELS } from "../utils/catalogueLabels";
import { CatalogItemStatusBadge } from "./CatalogItemStatusBadge";

type Props = {
  items: CatalogItem[];
  canManage: boolean;
};

export function CatalogItemsTable({ items, canManage }: Props) {
  const columns: DataTableColumn<CatalogItem>[] = [
    {
      key: "item",
      header: "Article / Service",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {item.name}
          </p>
          <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {ITEM_TYPE_LABELS[item.itemType]}
        </span>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      render: (item) => item.category?.name ?? "—",
    },
    {
      key: "price",
      header: "Prix HT",
      render: (item) => formatPriceHt(item.priceHt),
    },
    {
      key: "tax",
      header: "TVA",
      render: (item) =>
        item.taxRate ? `${item.taxRate.name} (${item.taxRate.rate}%)` : "—",
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <CatalogItemStatusBadge isArchived={item.isArchived} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/catalogue/${item.id}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Fiche
          </Link>
          {canManage && !item.isArchived ? (
            <Link
              href={`/catalogue/${item.id}/modifier`}
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
          <DataTable<CatalogItem>
            data={items}
            columns={columns}
            rowKey={(item) => item.id}
            emptyState={
              <EmptyState
                title="Aucun article"
                description="Créez votre premier article ou service du catalogue."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/catalogue/nouveau"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Nouvel article
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
