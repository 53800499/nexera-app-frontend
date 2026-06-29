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
import { CatalogItemForm } from "../components/CatalogItemForm";
import { buildCreateItemPayload } from "../utils/catalogMappers";
import {
  useCatalogCategories,
  useCatalogueItems,
  useTaxRates,
} from "../hooks/useCatalogue";
import { useCatalogAccess } from "../hooks/useCatalogAccess";

export default function CreateCatalogItemPage() {
  const router = useRouter();
  const toast = useToast();
  const { canReadTaxRates } = useCatalogAccess();
  const { createItemMutation } = useCatalogueItems();
  const { categoriesQuery } = useCatalogCategories();
  const taxRatesQuery = useTaxRates();

  const isLoading = categoriesQuery.isLoading || taxRatesQuery.isLoading;

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
            Nouvel article / service
          </h1>
          <p className="text-sm text-gray-500">
            Création d&apos;un élément du catalogue (UC-02). La référence
            ART-XXXXXX sera générée automatiquement.
          </p>
        </div>

        {isLoading && <LoadingBlock label="Chargement des données..." />}

        {!canReadTaxRates && !taxRatesQuery.isLoading ? (
          <ErrorState
            title="Taux de TVA indisponibles"
            message="La permission settings.read est requise pour charger les taux de TVA."
          />
        ) : null}

        {taxRatesQuery.isError ? (
          <ErrorState
            title="Taux de TVA indisponibles"
            message="Impossible de charger les taux de TVA."
            onRetry={() => taxRatesQuery.refetch()}
          />
        ) : null}

        {categoriesQuery.data && taxRatesQuery.data ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <CatalogItemForm
              categories={categoriesQuery.data}
              taxRates={taxRatesQuery.data}
              isSubmitting={createItemMutation.isPending}
              submitLabel="Créer l'article"
              onSubmit={async (values) => {
                try {
                  const item = await createItemMutation.mutateAsync(
                    buildCreateItemPayload(values),
                  );
                  toast.success("Article créé", item.name);
                  router.push(`/catalogue/${item.id}`);
                } catch {
                  toast.error(
                    "Création impossible",
                    "Vérifiez les champs obligatoires et réessayez.",
                  );
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </RequireCatalogAccess>
  );
}
