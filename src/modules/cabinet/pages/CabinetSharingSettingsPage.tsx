"use client";

import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { SettingsPageHeader } from "@/modules/parametres/components/SettingsPageHeader";
import { useSettingsAccess } from "@/modules/parametres/hooks/useSettingsAccess";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { AuthorizedCabinetsList } from "../components/AuthorizedCabinetsList";
import { CabinetIdentityPanel } from "../components/CabinetIdentityPanel";
import { GrantCabinetAccessForm } from "../components/GrantCabinetAccessForm";
import { RequireCabinetAccess } from "../components/RequireCabinetAccess";
import { useCabinetAccessGrant } from "../hooks/useCabinetAccessGrant";

export default function CabinetSharingSettingsPage() {
  const user = useAuthUser();
  const { canManageSettings } = useSettingsAccess();
  const isCabinet = user?.workspace === WORKSPACE_TYPES.CABINET;
  const { authorizedCabinetsQuery } = useCabinetAccessGrant(!isCabinet);

  if (isCabinet) {
    return (
      <RequireCabinetAccess>
        <div className="space-y-6">
          <SettingsPageHeader
            title="Code d'invitation cabinet"
            description="Partagez ce code opaque avec vos clients entreprise. Ne communiquez jamais l'UUID interne de votre organisation."
          />
          <CabinetIdentityPanel />
        </div>
      </RequireCabinetAccess>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Cabinet comptable"
        description="Autorisez votre expert-comptable via son code d'invitation (pas son UUID interne)."
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Autoriser un cabinet
        </h3>
        <p className="mt-1 mb-4 text-sm text-gray-500">
          Saisissez le code d&apos;invitation fourni par votre cabinet comptable.
        </p>
        <GrantCabinetAccessForm canManage={canManageSettings} />
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Cabinets autorisés
        </h3>
        {authorizedCabinetsQuery.isLoading ? (
          <LoadingBlock label="Chargement des cabinets..." />
        ) : authorizedCabinetsQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des cabinets autorisés."
            onRetry={() => authorizedCabinetsQuery.refetch()}
          />
        ) : (
          <AuthorizedCabinetsList
            cabinets={authorizedCabinetsQuery.data ?? []}
            canManage={canManageSettings}
          />
        )}
      </section>
    </div>
  );
}
