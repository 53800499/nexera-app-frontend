"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequirePermission } from "../components/RequirePermission";
import { RolesTable } from "../components/RolesTable";
import { useAccessControl } from "../hooks/useAccessControl";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/role.types";

export default function RolesListPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageRoles } = useAccessControl();
  const { rolesQuery, deleteMutation } = useRoles();

  const handleDelete = (role: Role) => {
    void runAction({
      confirm: {
        title: "Supprimer ce rôle ?",
        message: `Le rôle « ${role.name} » sera supprimé définitivement. Cette action est irréversible.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du rôle...",
      success: {
        title: "Rôle supprimé",
        message: role.name,
      },
      error: {
        title: "Suppression impossible",
        message:
          "Ce rôle ne peut pas être supprimé s'il est encore assigné à des utilisateurs.",
      },
      action: () => deleteMutation.mutateAsync(role.id),
    });
  };

  return (
    <RequirePermission permission="manage:roles">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Rôles & permissions
            </h1>
            <p className="text-sm text-gray-500">
              Gérez les rôles du tenant et leurs droits d&apos;accès.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/roles/matricede-permissions"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Matrice permissions
            </Link>
            {canManageRoles ? (
              <Link
                href="/roles/nouveau"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Nouveau rôle
              </Link>
            ) : null}
          </div>
        </div>

        {rolesQuery.isLoading && (
          <LoadingBlock label="Chargement des rôles..." />
        )}

        {rolesQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des rôles."
            onRetry={() => rolesQuery.refetch()}
          />
        )}

        {rolesQuery.data ? (
          <RolesTable
            roles={rolesQuery.data}
            canManage={canManageRoles}
            isDeleting={deleteMutation.isPending || isBusy}
            onDelete={handleDelete}
          />
        ) : null}
      </div>
    </RequirePermission>
  );
}
