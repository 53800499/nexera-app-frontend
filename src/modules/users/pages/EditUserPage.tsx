"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  buildUpdateUserPayload,
  UserForm,
} from "../components/UserForm";
import { RequireUserAccess } from "../components/RequireUserAccess";
import type { UpdateUserFormValues } from "../schemas/userForm.schema";
import { useUser, useUsers } from "../hooks/useUsers";
import { getUserFullName } from "../utils/userFormatters";

export default function EditUserPage({ id }: { id: string }) {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const userQuery = useUser(id);
  const { rolesQuery, updateMutation, syncRolesMutation } = useUsers();

  if (userQuery.isPending || rolesQuery.isPending) {
    return <LoadingBlock label="Chargement de l'utilisateur..." />;
  }

  if (userQuery.isError) {
    return (
      <ErrorState
        title="Utilisateur introuvable"
        message="Impossible de charger cet utilisateur. Vérifiez l'identifiant ou réessayez."
        onRetry={() => userQuery.refetch()}
        action={
          <Link
            href="/utilisateurs"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Retour à la liste
          </Link>
        }
      />
    );
  }

  if (!userQuery.data) {
    return (
      <EmptyState
        title="Utilisateur introuvable"
        description="Cet utilisateur n'existe plus."
        action={
          <Link
            href="/utilisateurs"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white"
          >
            Retour à la liste
          </Link>
        }
      />
    );
  }

  const user = userQuery.data;
  const currentRoleIds = user.roles.map((link) => link.role.id);

  const submit = async (values: UpdateUserFormValues) => {
    await runAction({
      confirm: {
        title: "Enregistrer les modifications ?",
        message: "Les informations et les rôles de l'utilisateur seront mis à jour.",
        confirmLabel: "Enregistrer",
      },
      loadingMessage: "Mise à jour de l'utilisateur...",
      success: {
        title: "Utilisateur mis à jour",
        message: getUserFullName(user),
      },
      redirectTo: `/utilisateurs/${user.id}`,
      redirectMessage: "Retour à la fiche utilisateur...",
      showResultOnError: false,
      rethrowOnError: true,
      action: async () => {
        await updateMutation.mutateAsync({
          id: user.id,
          payload: buildUpdateUserPayload(values),
        });
        await syncRolesMutation.mutateAsync({
          userId: user.id,
          currentRoleIds,
          nextRoleIds: values.roleIds ?? [],
        });
      },
    });
  };

  return (
    <RequireUserAccess requireManage>
      <div className="space-y-6">
        <Link
          href={`/utilisateurs/${user.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour à la fiche
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Modifier {getUserFullName(user)}
          </h1>
          <p className="text-sm text-gray-500">
            Mettez à jour les informations et les rôles de cet utilisateur.
          </p>
        </div>

        {rolesQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger les rôles. Réessayez avant d'enregistrer."
            onRetry={() => rolesQuery.refetch()}
          />
        ) : null}

        {rolesQuery.data ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
            <UserForm
              mode="update"
              formKey={user.id}
              roles={rolesQuery.data}
              isSubmitting={
                updateMutation.isPending ||
                syncRolesMutation.isPending ||
                isBusy
              }
              submitLabel="Enregistrer les modifications"
              onCancel={() => router.push(`/utilisateurs/${user.id}`)}
              defaultValues={{
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                roleIds: currentRoleIds,
              }}
              onSubmit={submit}
            />
          </div>
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
