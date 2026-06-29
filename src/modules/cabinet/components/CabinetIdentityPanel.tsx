"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { AppError } from "@/shared/core/AppError";
import { CopyableTenantId } from "./CopyableTenantId";
import { useCabinetInviteCode } from "../hooks/useCabinetInviteCode";
import { useSettingsAccess } from "@/modules/parametres/hooks/useSettingsAccess";

export function CabinetIdentityPanel() {
  const toast = useToast();
  const { canManageSettings } = useSettingsAccess();
  const { inviteCodeQuery, regenerateMutation } = useCabinetInviteCode();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync();
      toast.success("Nouveau code d'invitation généré.");
      setConfirmRegenerate(false);
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Impossible de régénérer le code.";
      toast.error(message);
    }
  };

  if (inviteCodeQuery.isLoading) {
    return <LoadingBlock label="Chargement du code d'invitation..." />;
  }

  if (inviteCodeQuery.isError || !inviteCodeQuery.data?.inviteCode) {
    return (
      <ErrorState
        title="Code indisponible"
        message="Impossible de charger le code d'invitation."
        onRetry={() => inviteCodeQuery.refetch()}
      />
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
        Code d&apos;invitation cabinet
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Transmettez ce code à vos clients entreprise (e-mail sécurisé, pas en
        public). Ils le saisissent dans{" "}
        <strong>Paramètres → Cabinet comptable</strong>. Ne partagez jamais
        l&apos;identifiant technique interne (UUID) de votre organisation.
      </p>

      <div className="mt-4">
        <CopyableTenantId
          tenantId={inviteCodeQuery.data.inviteCode}
          label="Code d'invitation"
        />
      </div>

      {canManageSettings ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm text-amber-950 dark:text-amber-100">
            En cas de fuite du code, régénérez-le. Les entreprises déjà
            autorisées restent liées ; seules les nouvelles autorisations
            utiliseront le nouveau code.
          </p>
          {confirmRegenerate ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={regenerateMutation.isPending}
                onClick={handleRegenerate}
              >
                {regenerateMutation.isPending
                  ? "Régénération..."
                  : "Confirmer la régénération"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmRegenerate(false)}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => setConfirmRegenerate(true)}
            >
              Régénérer le code
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}
