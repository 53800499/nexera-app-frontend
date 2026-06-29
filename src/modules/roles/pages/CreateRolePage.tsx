"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequirePermission } from "../components/RequirePermission";
import { RoleForm } from "../components/RoleForm";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";

export default function CreateRolePage() {
  const router = useRouter();
  const toast = useToast();
  const tenantId = useAuthStore((state) => state.user?.tenantId ?? "");
  const { permissionsQuery } = usePermissions();
  const { createMutation } = useRoles();

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
              permissions={permissionsQuery.data}
              isSubmitting={createMutation.isPending}
              submitLabel="Créer le rôle"
              onSubmit={async (values) => {
                try {
                  const role = await createMutation.mutateAsync({
                    name: values.name,
                    code: values.code.toUpperCase(),
                    description: values.description || undefined,
                    tenantId,
                    permissionIds: values.permissionIds,
                  });
                  toast.success("Rôle créé", role.name);
                  router.push(`/roles/${role.id}`);
                } catch {
                  toast.error(
                    "Création impossible",
                    "Vérifiez que le code est unique pour ce tenant.",
                  );
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </RequirePermission>
  );
}
