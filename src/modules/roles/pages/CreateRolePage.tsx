"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequirePermission } from "../components/RequirePermission";
import {
  buildCreateRolePayload,
  RoleForm,
} from "../components/RoleForm";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";
import type { RoleFormValues } from "../schemas/roleForm.schema";

export default function CreateRolePage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const tenantId = useAuthStore((state) => state.user?.tenantId ?? "");
  const { permissionsQuery } = usePermissions();
  const { createMutation } = useRoles();

  const submit = async (values: RoleFormValues) => {
    await runAction({
      confirm: {
        title: "Créer ce rôle ?",
        message: `Le rôle « ${values.name} » (${values.code.toUpperCase()}) sera ajouté avec les permissions sélectionnées.`,
        confirmLabel: "Créer",
      },
      loadingMessage: "Création du rôle...",
      success: {
        title: "Rôle créé",
        message: values.name,
      },
      redirectTo: (role) => `/roles/${role.id}`,
      redirectMessage: "Ouverture de la fiche rôle...",
      error: {
        title: "Création impossible",
        message:
          "Vérifiez le nom, le code (unique par organisation) et les permissions sélectionnées.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        createMutation.mutateAsync(buildCreateRolePayload(values, tenantId)),
    });
  };

  return (
    <RequirePermission permission="manage:roles">
      <div className="space-y-4">
        <Link
          href="/roles"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux rôles
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau rôle
          </h1>
          <p className="text-sm text-gray-500">
            Créez un rôle et attribuez-lui des permissions.
          </p>
        </div>

        {permissionsQuery.isLoading && (
          <LoadingBlock label="Chargement des permissions..." />
        )}

        {permissionsQuery.isError && (
          <ErrorState
            title="Permissions indisponibles"
            message="Impossible de charger le catalogue des permissions. Vérifiez que vous disposez de manage:permissions."
            onRetry={() => permissionsQuery.refetch()}
          />
        )}

        {permissionsQuery.data ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <RoleForm
              formKey="create"
              permissions={permissionsQuery.data}
              isSubmitting={createMutation.isPending || isBusy}
              submitLabel="Créer le rôle"
              onCancel={() => router.push("/roles")}
              onSubmit={submit}
            />
          </div>
        ) : null}
      </div>
    </RequirePermission>
  );
}
