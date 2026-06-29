"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequirePermission } from "../components/RequirePermission";
import { RoleDetailsCard } from "../components/RoleDetailsCard";
import { RolePermissionsEditor } from "../components/RolePermissionsEditor";
import { usePermissions } from "../hooks/usePermissions";
import { useRole, useRoles } from "../hooks/useRoles";

export default function RoleDetailsPage({ id }: { id: string }) {
  const toast = useToast();
  const roleQuery = useRole(id);
  const { permissionsQuery } = usePermissions();
  const { updateMutation } = useRoles();

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

        {roleQuery.isLoading && (
          <LoadingBlock label="Chargement du rôle..." />
        )}

        {roleQuery.isError && (
          <ErrorState
            title="Rôle introuvable"
            message="Impossible de charger ce rôle."
            onRetry={() => roleQuery.refetch()}
            action={
              <Link
                href="/roles"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {!roleQuery.isLoading && !roleQuery.isError && !roleQuery.data && (
          <EmptyState
            title="Rôle introuvable"
            description="Ce rôle n'existe pas ou n'est plus accessible."
            action={
              <Link
                href="/roles"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {roleQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {roleQuery.data.name}
              </h1>
              <p className="text-sm text-gray-500">
                Détail du rôle et gestion des permissions associées.
              </p>
            </div>

            <RoleDetailsCard role={roleQuery.data} />

            {permissionsQuery.isLoading ? (
              <LoadingBlock
                label="Chargement des permissions..."
                minHeight="min-h-[120px]"
              />
            ) : null}

            {permissionsQuery.isError ? (
              <ErrorState
                title="Permissions indisponibles"
                message="Le catalogue des permissions est inaccessible. Vérifiez le droit manage:permissions."
                onRetry={() => permissionsQuery.refetch()}
              />
            ) : null}

            {permissionsQuery.data ? (
              <RolePermissionsEditor
                role={roleQuery.data}
                permissions={permissionsQuery.data}
                isSaving={updateMutation.isPending}
                onSave={async (permissionIds) => {
                  try {
                    await updateMutation.mutateAsync({
                      id: roleQuery.data.id,
                      payload: { permissionIds },
                    });
                    toast.success(
                      "Permissions mises à jour",
                      roleQuery.data.name,
                    );
                  } catch {
                    toast.error(
                      "Échec de la sauvegarde",
                      "Les permissions n'ont pas pu être enregistrées.",
                    );
                  }
                }}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </RequirePermission>
  );
}
