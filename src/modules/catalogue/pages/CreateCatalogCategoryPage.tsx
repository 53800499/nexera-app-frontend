"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { LoadingBlock, useToast } from "@/shared/components/feedback";
import { RequireCatalogAccess } from "../components/RequireCatalogAccess";
import { CatalogCategoryForm } from "../components/CatalogCategoryForm";
import { useCatalogCategories } from "../hooks/useCatalogue";
import { buildCreateCategoryPayload } from "../utils/catalogCategoryMappers";

export default function CreateCatalogCategoryPage() {
  const router = useRouter();
  const toast = useToast();
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
              isSubmitting={createCategoryMutation.isPending}
              submitLabel="Créer la catégorie"
              onCancel={() => router.push("/catalogue")}
              onSubmit={async (values) => {
                try {
                  await createCategoryMutation.mutateAsync(
                    buildCreateCategoryPayload(values),
                  );
                  toast.success("Catégorie créée");
                  router.push("/catalogue");
                } catch {
                  toast.error("Création impossible");
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
