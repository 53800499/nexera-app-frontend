"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { TenantSettingsForm } from "../components/TenantSettingsForm";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { useTenantSettings } from "../hooks/useSettings";
import type { TenantSettingsFormValues } from "../schemas/settingsForm.schema";

function buildTenantPayload(values: TenantSettingsFormValues) {
  return {
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
    numeroInscriptionOrdre: values.numeroInscriptionOrdre || undefined,
    paysCode: values.paysCode || undefined,
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
  };
}

export default function TenantSettingsPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const user = useAuthUser();
  const isCabinet = user?.workspace === WORKSPACE_TYPES.CABINET;
  const { canManageSettings } = useSettingsAccess();
  const { tenantQuery, updateMutation } = useTenantSettings();

  const handleSubmit = async (values: TenantSettingsFormValues) => {
    const label =
      values.tradeName ||
      values.legalName ||
      (isCabinet ? "votre cabinet" : "votre entreprise");
    await runAction({
      confirm: {
        title: isCabinet
          ? "Enregistrer les paramètres du cabinet ?"
          : "Enregistrer les paramètres entreprise ?",
        message: `Les informations de ${label} seront mises à jour sur vos documents et dans l'application.`,
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement des paramètres...",
      success: {
        title: "Paramètres enregistrés",
        message: label,
      },
      error: {
        title: "Enregistrement impossible",
        message:
          "Vérifiez la devise, les coordonnées et les champs obligatoires puis réessayez.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => updateMutation.mutateAsync(buildTenantPayload(values)),
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title={isCabinet ? "Cabinet d'expertise comptable" : "Entreprise"}
        description={
          isCabinet
            ? "Identité légale, inscription à l'Ordre et coordonnées de votre cabinet."
            : "Identité légale, coordonnées et paramètres financiers de votre organisation."
        }
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
          isCabinet={isCabinet}
          readOnly={!canManageSettings}
          isSubmitting={updateMutation.isPending || isBusy}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
