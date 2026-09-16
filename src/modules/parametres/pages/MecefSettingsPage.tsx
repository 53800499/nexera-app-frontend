"use client";

import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { MecefSettingsForm } from "../components/MecefSettingsForm";
import { useSettingsAccess } from "../hooks/useSettingsAccess";
import { useMecefConfig } from "../hooks/useMecefConfig";
import type { UpdateMecefConfigPayload } from "@/modules/factures/types/invoice.types";

export default function MecefSettingsPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageSettings } = useSettingsAccess();
  const { mecefQuery, updateMutation } = useMecefConfig();

  const handleSubmit = async (payload: UpdateMecefConfigPayload) => {
    await runAction({
      confirm: {
        title: "Enregistrer la configuration e-MECeF ?",
        message:
          payload.mecefEnvironment === "production"
            ? "Attention : vous êtes en mode Production. Toute facture émise sera certifiée et transmise en temps réel aux serveurs de la DGI Bénin."
            : "Les paramètres de connexion au serveur e-MECeF seront mis à jour pour votre entreprise.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Enregistrement des paramètres e-MECeF...",
      success: {
        title: "Configuration e-MECeF mise à jour",
        message: "Les identifiants et le mode de normalisation ont été enregistrés.",
      },
      error: {
        title: "Erreur d'enregistrement",
        message:
          "Vérifiez l'URL de l'API et le jeton de sécurité DGI puis réessayez.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () => updateMutation.mutateAsync(payload),
    });
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Facturation e-MECeF (DGI Bénin)"
        description="Configuration du Système de Facturation Électronique : Numéro d'Identification Machine (NIM), jeton API DGI et mode de normalisation."
      />

      {mecefQuery.isPending && !mecefQuery.data && (
        <LoadingBlock label="Chargement de la configuration e-MECeF..." />
      )}

      {mecefQuery.isError && (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger la configuration e-MECeF. Vérifiez votre connexion ou contactez l'administrateur."
          onRetry={() => mecefQuery.refetch()}
        />
      )}

      {mecefQuery.data ? (
        <MecefSettingsForm
          config={mecefQuery.data}
          readOnly={!canManageSettings}
          isSubmitting={updateMutation.isPending || isBusy}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
