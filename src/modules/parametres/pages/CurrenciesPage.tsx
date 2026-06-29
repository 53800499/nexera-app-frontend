"use client";

import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { CurrenciesManager } from "../components/CurrenciesManager";
import { SettingsContentCard } from "../components/SettingsContentCard";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useCurrencies } from "../hooks/useSettings";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import type { CurrencyFormValues } from "../schemas/settingsForm.schema";

export default function CurrenciesPage() {
  const { canManageSettings } = useSettingsAccess();
  const { currenciesQuery, createMutation, updateMutation, deleteMutation } =
    useCurrencies();

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const toCreatePayload = (values: CurrencyFormValues) => ({
    code: values.code.toUpperCase(),
    name: values.name,
    symbol: values.symbol || undefined,
    manualRate:
      values.manualRate && values.manualRate.trim()
        ? Number(values.manualRate)
        : undefined,
  });

  const toUpdatePayload = (values: CurrencyFormValues) => ({
    name: values.name,
    symbol: values.symbol || undefined,
    manualRate:
      values.manualRate && values.manualRate.trim()
        ? Number(values.manualRate)
        : undefined,
    isActive: values.isActive,
  });

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Devises"
        description="Devise principale et devises secondaires acceptées sur vos documents."
      />

      {currenciesQuery.isPending && !currenciesQuery.data && (
        <LoadingBlock label="Chargement des devises..." />
      )}

      {currenciesQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les devises."
          onRetry={() => currenciesQuery.refetch()}
        />
      )}

      {currenciesQuery.data ? (
        <SettingsContentCard>
          <CurrenciesManager
            currencies={currenciesQuery.data}
            canManage={canManageSettings}
            isSubmitting={isSubmitting}
            onCreate={async (values) => {
              await createMutation.mutateAsync(toCreatePayload(values));
            }}
            onUpdate={async (id, values) => {
              await updateMutation.mutateAsync({
                id,
                payload: toUpdatePayload(values),
              });
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
