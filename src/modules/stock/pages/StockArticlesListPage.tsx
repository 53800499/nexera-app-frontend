"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../components/RequireStockAccess";
import { StockArticlesTable } from "../components/StockArticlesTable";
import { useStockAccess } from "../hooks/useStockAccess";
import { useStockArticles } from "../hooks/useStock";

export default function StockArticlesListPage() {
  const { canManageStock } = useStockAccess();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const articlesQuery = useStockArticles(query || undefined);

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Articles stock
            </h1>
            <p className="text-sm text-gray-500">
              Configuration stock des articles catalogue (UC-S01).
            </p>
          </div>
          <Link
            href="/stock/entrepots"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Entrepôts
          </Link>
        </div>

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

        {articlesQuery.isLoading && (
          <LoadingBlock label="Chargement des articles..." />
        )}

        {articlesQuery.isError && (
          <ErrorState
            title="Impossible de charger les articles"
            message="Une erreur est survenue lors du chargement."
            onRetry={() => articlesQuery.refetch()}
          />
        )}

        {articlesQuery.data ? (
          <StockArticlesTable
            articles={articlesQuery.data}
            canManage={canManageStock}
          />
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
