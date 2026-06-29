"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { PermissionsMatrix } from "../components/PermissionsMatrix";
import { RequirePermission } from "../components/RequirePermission";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";

export default function PermissionsMatrixPage() {
  const toast = useToast();
  const { rolesQuery, togglePermissionMutation } = useRoles();
  const { permissionsQuery } = usePermissions();
  const [updatingCell, setUpdatingCell] = useState<{
    roleId: string;
    permissionId: string;
  } | null>(null);

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const isError = rolesQuery.isError || permissionsQuery.isError;

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
            Matrice des permissions
          </h1>
          <p className="text-sm text-gray-500">
            Vue croisée rôles × permissions. Cochez ou décochez pour attribuer
            les droits en temps réel.
          </p>
        </div>

        {isLoading && <LoadingBlock label="Chargement de la matrice..." />}

        {isError && (
          <ErrorState
            title="Matrice indisponible"
            message="Impossible de charger les rôles ou les permissions."
            onRetry={() => {
              rolesQuery.refetch();
              permissionsQuery.refetch();
            }}
          />
        )}

        {rolesQuery.data && permissionsQuery.data ? (
          <PermissionsMatrix
            roles={rolesQuery.data}
            permissions={permissionsQuery.data}
            isUpdating={togglePermissionMutation.isPending}
            updatingCell={updatingCell}
            onToggle={(roleId, permissionId, enabled) => {
              setUpdatingCell({ roleId, permissionId });
              togglePermissionMutation.mutate(
                { roleId, permissionId, enabled },
                {
                  onSuccess: () => {
                    toast.success(
                      enabled ? "Permission ajoutée" : "Permission retirée",
                    );
                  },
                  onError: () => {
                    toast.error(
                      "Modification impossible",
                      "La permission n'a pas pu être mise à jour.",
                    );
                  },
                  onSettled: () => setUpdatingCell(null),
                },
              );
            }}
          />
        ) : null}

        {permissionsQuery.isError && rolesQuery.data ? (
          <ErrorState
            title="Permissions indisponibles"
            message="La matrice nécessite l'accès au catalogue des permissions (manage:permissions)."
            onRetry={() => permissionsQuery.refetch()}
          />
        ) : null}
      </div>
    </RequirePermission>
  );
}
