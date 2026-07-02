"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogCategoryForm } from "../components/CatalogCategoryForm";
import { useCatalogCategories } from "../hooks/useCatalogue";
import { buildCreateCategoryPayload } from "../utils/catalogCategoryMappers";

export default function CreateCatalogCategoryPage() {
  const { runAction, redirectWithLoader } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { categoriesQuery, createCategoryMutation } = useCatalogCategories();

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

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvelle catégorie
          </h1>
          <p className="text-sm text-gray-500">
            Création d&apos;une catégorie du catalogue.
          </p>
        </div>

        {categoriesQuery.isLoading && (
          <LoadingBlock label="Chargement des catégories..." />
        )}

        {categoriesQuery.data ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <CatalogCategoryForm
              categories={categoriesQuery.data}
              isSubmitting={isBusy}
              submitLabel="Créer la catégorie"
              onCancel={() =>
                redirectWithLoader("/catalogue", "Retour au catalogue...")
              }
              onSubmit={async (values) => {
                await runAction({
                  confirm: {
                    title: "Créer cette catégorie ?",
                    message: `Confirmer la création de « ${values.name} ».`,
                    confirmLabel: "Créer",
                  },
                  loadingMessage: "Création de la catégorie...",
                  success: {
                    title: "Catégorie créée",
                    message: values.name,
                  },
                  error: {
                    title: "Création impossible",
                    message: "Vérifiez les champs et réessayez.",
                  },
                  redirectTo: "/catalogue",
                  redirectMessage: "Retour au catalogue...",
                  action: () =>
                    createCategoryMutation.mutateAsync(
                      buildCreateCategoryPayload(values),
                    ),
                });
              }}
            />
          </div>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
