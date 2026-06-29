"use client";

import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { TenantSettingsForm } from "../components/TenantSettingsForm";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { useTenantSettings } from "../hooks/useSettings";
import type { TenantSettingsFormValues } from "../schemas/settingsForm.schema";

export default function TenantSettingsPage() {
  const { canManageSettings } = useSettingsAccess();
  const { tenantQuery, updateMutation } = useTenantSettings();

  const handleSubmit = async (values: TenantSettingsFormValues) => {
    await updateMutation.mutateAsync({
      primaryCurrency: values.primaryCurrency,
      exchangeRateSource: values.exchangeRateSource,
      latePaymentPenaltyRate:
        values.latePaymentPenaltyRate && values.latePaymentPenaltyRate.trim()
          ? Number(values.latePaymentPenaltyRate)
          : undefined,
      latePaymentPenaltyText: values.latePaymentPenaltyText || undefined,
      legalName: values.legalName || undefined,
      tradeName: values.tradeName || undefined,
      siret: values.siret || undefined,
      vatNumber: values.vatNumber || undefined,
      registrationNumber: values.registrationNumber || undefined,
      shareCapital: values.shareCapital || undefined,
      companyAddress: {
        street: values.street || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined,
        country: values.country || undefined,
      },
      companyPhone: values.companyPhone || undefined,
      companyEmail: values.companyEmail || undefined,
      companyWebsite: values.companyWebsite || undefined,
      acceptedPaymentMethods: values.acceptedPaymentMethods || undefined,
      cgvText: values.cgvText || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Entreprise"
        description="Identité légale, coordonnées et paramètres financiers de votre organisation."
      />

      {tenantQuery.isPending && !tenantQuery.data && (
        <LoadingBlock label="Chargement des paramètres..." />
      )}

      {tenantQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger les paramètres entreprise."
          onRetry={() => tenantQuery.refetch()}
        />
      )}

      {tenantQuery.data ? (
        <TenantSettingsForm
          settings={tenantQuery.data}
          readOnly={!canManageSettings}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
