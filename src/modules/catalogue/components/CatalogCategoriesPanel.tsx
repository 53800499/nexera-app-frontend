"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { useCatalogCategories } from "../hooks/useCatalogue";
import type { CatalogCategory } from "../types/catalogue.types";

type Props = {
  canManage: boolean;
};

export function CatalogCategoriesPanel({ canManage }: Props) {
  const toast = useToast();
  const { categoriesQuery, deleteCategoryMutation } = useCatalogCategories();

  const onDelete = (category: CatalogCategory) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) {
      return;
    }
    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => toast.success("Catégorie supprimée"),
      onError: () => toast.error("Suppression impossible"),
    });
  };

  if (categoriesQuery.isLoading) {
    return <LoadingBlock label="Chargement des catégories..." />;
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Catégories indisponibles"
        message="Impossible de charger les catégories du catalogue."
        onRetry={() => categoriesQuery.refetch()}
      />
    );
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Catégories du catalogue
          </h3>
          <p className="text-sm text-gray-500">
            Organisation hiérarchique des articles.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/catalogue/categories/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nouvelle catégorie
          </Link>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Parent</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 4 : 3}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Aucune catégorie.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {category.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {category.parent?.name ?? "—"}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/catalogue/categories/${category.id}/modifier`}
                          className="rounded border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="rounded border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50"
                          disabled={deleteCategoryMutation.isPending}
                          onClick={() => onDelete(category)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
