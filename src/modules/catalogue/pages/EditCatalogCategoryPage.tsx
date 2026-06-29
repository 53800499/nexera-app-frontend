"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogCategoryForm } from "../components/CatalogCategoryForm";
import { useCatalogCategories, useCatalogCategory } from "../hooks/useCatalogue";
import {
  buildUpdateCategoryPayload,
  categoryToFormValues,
} from "../utils/catalogCategoryMappers";

export default function EditCatalogCategoryPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const categoryQuery = useCatalogCategory(id);
  const { categoriesQuery, updateCategoryMutation } = useCatalogCategories();

  const isLoading = categoryQuery.isLoading || categoriesQuery.isLoading;

  return (
    <RequireCatalogAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/catalogue"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au catalogue
        </Link>

        {isLoading && <LoadingBlock label="Chargement de la catégorie..." />}

        {categoryQuery.isError && (
          <ErrorState
            title="Catégorie introuvable"
            message="Impossible de charger cette catégorie."
            onRetry={() => categoryQuery.refetch()}
            action={
              <Link
                href="/catalogue"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour au catalogue
              </Link>
            }
          />
        )}

        {categoryQuery.data && categoriesQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier la catégorie
              </h1>
              <p className="text-sm text-gray-500">{categoryQuery.data.name}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <CatalogCategoryForm
                categories={categoriesQuery.data}
                excludeCategoryId={id}
                defaultValues={categoryToFormValues(categoryQuery.data)}
                isSubmitting={updateCategoryMutation.isPending}
                submitLabel="Enregistrer les modifications"
                onCancel={() => router.push("/catalogue")}
                onSubmit={async (values) => {
                  try {
                    await updateCategoryMutation.mutateAsync({
                      id,
                      payload: buildUpdateCategoryPayload(values),
                    });
                    toast.success("Catégorie mise à jour");
                    router.push("/catalogue");
                  } catch {
                    toast.error("Modification impossible");
                  }
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
