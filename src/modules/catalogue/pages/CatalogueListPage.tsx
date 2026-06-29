"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogItemsTable } from "../components/CatalogItemsTable";
import { CatalogCategoriesPanel } from "../components/CatalogCategoriesPanel";
import { useCatalogAccess } from "../hooks/useCatalogAccess";
import { useCatalogueItems } from "../hooks/useCatalogue";

type Tab = "items" | "categories";

export default function CatalogueListPage() {
  const { canManageCatalogue } = useCatalogAccess();
  const [tab, setTab] = useState<Tab>("items");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { itemsQuery } = useCatalogueItems(query || undefined);

  return (
    <RequireCatalogAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Catalogue
            </h1>
            <p className="text-sm text-gray-500">
              Articles, services, catégories et tarifs (UC-02).
            </p>
          </div>
          {canManageCatalogue && tab === "items" ? (
            <Link
              href="/catalogue/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouvel article
            </Link>
          ) : canManageCatalogue && tab === "categories" ? (
            <Link
              href="/catalogue/categories/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouvelle catégorie
            </Link>
          ) : null}
        </div>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setTab("items")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "items"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Articles & services
          </button>
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "categories"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Catégories
          </button>
        </div>

        {tab === "items" ? (
          <>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search.trim());
              }}
            >
              <div className="min-w-[260px] flex-1">
                <Input
                  placeholder="Rechercher par référence ou désignation..."
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

            {itemsQuery.isLoading && (
              <LoadingBlock label="Chargement du catalogue..." />
            )}

            {itemsQuery.isError && (
              <ErrorState
                title="Échec du chargement"
                message="Impossible de charger les articles du catalogue."
                onRetry={() => itemsQuery.refetch()}
              />
            )}

            {itemsQuery.data ? (
              <CatalogItemsTable
                items={itemsQuery.data}
                canManage={canManageCatalogue}
              />
            ) : null}
          </>
        ) : (
          <CatalogCategoriesPanel canManage={canManageCatalogue} />
        )}
      </div>
    </RequireCatalogAccess>
  );
}
