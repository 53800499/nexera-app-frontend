"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireUserAccess } from "../components/RequireUserAccess";
import { UserForm } from "../components/UserForm";
import { useUsers } from "../hooks/useUsers";

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { rolesQuery, createMutation } = useUsers();

  return (
    <RequireUserAccess requireManage>
      <div className="space-y-6">
        <Link
          href="/utilisateurs"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvel utilisateur
          </h1>
          <p className="text-sm text-gray-500">
            Créez un compte et assignez ses rôles. Un email d&apos;invitation sera
            envoyé automatiquement.
          </p>
        </div>

        {rolesQuery.isPending && !rolesQuery.data ? (
          <LoadingBlock label="Chargement des rôles..." />
        ) : null}

        {rolesQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger les rôles disponibles."
            onRetry={() => rolesQuery.refetch()}
          />
        ) : null}

        {rolesQuery.data ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
            <UserForm
              mode="create"
              roles={rolesQuery.data}
              isSubmitting={createMutation.isPending}
              submitLabel="Créer l'utilisateur"
              onCancel={() => router.push("/utilisateurs")}
              onSubmit={async (values) => {
                try {
                  await createMutation.mutateAsync({
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    password: values.password || undefined,
                    isActive: values.isActive,
                    requestPasswordReset: values.requestPasswordReset,
                    roleIds: values.roleIds ?? [],
                  });
                  toast.success(
                    "Utilisateur créé",
                    `${values.firstName} ${values.lastName} a été ajouté.`,
                  );
                  router.push("/utilisateurs");
                } catch {
                  toast.error(
                    "Création impossible",
                    "Vérifiez les informations saisies et réessayez.",
                  );
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
