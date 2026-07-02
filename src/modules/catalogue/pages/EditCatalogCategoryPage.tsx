"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogCategoryForm } from "../components/CatalogCategoryForm";
import { useCatalogCategories, useCatalogCategory } from "../hooks/useCatalogue";
import {
  buildUpdateCategoryPayload,
  categoryToFormValues,
} from "../utils/catalogCategoryMappers";

export default function EditCatalogCategoryPage({ id }: { id: string }) {
  const { runAction, redirectWithLoader } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const categoryQuery = useCatalogCategory(id);
  const { categoriesQuery, updateCategoryMutation } = useCatalogCategories();

  const isPageLoading = categoryQuery.isLoading || categoriesQuery.isLoading;

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

        {isPageLoading && <LoadingBlock label="Chargement de la catégorie..." />}

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
                isSubmitting={isBusy}
                submitLabel="Enregistrer les modifications"
                onCancel={() =>
                  redirectWithLoader("/catalogue", "Retour au catalogue...")
                }
                onSubmit={async (values) => {
                  const categoryName = categoryQuery.data.name;
                  await runAction({
                    confirm: {
                      title: "Enregistrer les modifications ?",
                      message: `Mettre à jour la catégorie ${categoryName}.`,
                      confirmLabel: "Enregistrer",
                    },
                    loadingMessage: "Enregistrement de la catégorie...",
                    success: {
                      title: "Catégorie mise à jour",
                      message: categoryName,
                    },
                    error: {
                      title: "Modification impossible",
                      message: "Vérifiez les champs et réessayez.",
                    },
                    redirectTo: "/catalogue",
                    redirectMessage: "Retour au catalogue...",
                    action: () =>
                      updateCategoryMutation.mutateAsync({
                        id,
                        payload: buildUpdateCategoryPayload(values),
                      }),
                  });
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
