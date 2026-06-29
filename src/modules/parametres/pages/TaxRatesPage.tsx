"use client";

import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { TaxRatesManager } from "../components/TaxRatesManager";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { useTaxRatesManagement } from "../hooks/useSettings";

export default function TaxRatesPage() {
  const { canManageSettings } = useSettingsAccess();
  const { taxRatesQuery, createMutation, updateMutation, deleteMutation } =
    useTaxRatesManagement();

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Taux de TVA"
        description="Gérez les taux applicables et définissez le taux par défaut pour vos documents."
      />

      {taxRatesQuery.isPending && !taxRatesQuery.data && (
        <LoadingBlock label="Chargement des taux..." />
      )}

      {taxRatesQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les taux de TVA."
          onRetry={() => taxRatesQuery.refetch()}
        />
      )}

      {taxRatesQuery.data ? (
        <SettingsContentCard>
          <TaxRatesManager
            taxRates={taxRatesQuery.data}
            canManage={canManageSettings}
            isSubmitting={isSubmitting}
            onCreate={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            onUpdate={async (id, values) => {
              await updateMutation.mutateAsync({ id, payload: values });
            }}
            onDelete={async (id) => {
              await deleteMutation.mutateAsync(id);
            }}
          />
        </SettingsContentCard>
      ) : null}
    </div>
  );
}
