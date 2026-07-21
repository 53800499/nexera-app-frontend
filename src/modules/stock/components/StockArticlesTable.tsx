"use client";

import Link from "next/link";
import type { StockArticleRow } from "../types/stock.types";

type Props = {
  articles: StockArticleRow[];
  canManage: boolean;
};

export function StockArticlesTable({ articles, canManage }: Props) {
  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucun article produit dans le catalogue. Créez d&apos;abord un article
        de type produit.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
              Référence
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
              Désignation
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
              Qté miroir
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
              Config stock
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {articles.map((row) => (
            <tr key={row.catalogItemId} className="bg-white dark:bg-transparent">
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                {row.reference}
              </td>
              <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                {row.name}
                {row.isArchived ? (
                  <span className="ml-2 text-xs text-amber-600">Archivé</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                {row.stockQuantity} {row.unit}
              </td>
              <td className="px-4 py-3">
                {row.configured ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Configuré
                    {row.stockItem?.valuationMethod
                      ? ` · ${row.stockItem.valuationMethod.toUpperCase()}`
                      : ""}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Non configuré
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/stock/articles/${row.catalogItemId}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {row.configured
                    ? canManage
                      ? "Modifier"
                      : "Voir"
                    : canManage
                      ? "Configurer"
                      : "Voir"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
