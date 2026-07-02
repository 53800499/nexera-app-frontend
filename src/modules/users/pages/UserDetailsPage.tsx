"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireUserAccess } from "../components/RequireUserAccess";
import { UserDetailsCard } from "../components/UserDetailsCard";
import { UserPermissionsPanel } from "../components/UserPermissionsPanel";
import { useUserAccess } from "../hooks/useUserAccess";
import { useUser, useUserPermissions, useUsers } from "../hooks/useUsers";
import { getUserFullName } from "../utils/userFormatters";

export default function UserDetailsPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageUsers } = useUserAccess();
  const userQuery = useUser(id);
  const permissionsQuery = useUserPermissions(id, canManageUsers);
  const { toggleStatusMutation, removeMutation } = useUsers();

  if (userQuery.isPending) {
    return <LoadingBlock label="Chargement du profil utilisateur..." />;
  }

  if (userQuery.isError) {
    return (
      <ErrorState
        title="Utilisateur introuvable"
        message="Impossible de charger les détails de cet utilisateur. Vérifiez l'identifiant ou réessayez."
        onRetry={() => userQuery.refetch()}
        action={
          <Link
            href="/utilisateurs"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
        description="Cet utilisateur n'existe pas ou n'est plus accessible."
        action={
          <Link
            href="/utilisateurs"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Retour à la liste
          </Link>
        }
      />
    );
  }

  const user = userQuery.data;
  const fullName = getUserFullName(user);

  const handleToggleStatus = () => {
    void runAction({
      confirm: {
        title: user.isActive ? "Désactiver cet utilisateur ?" : "Activer cet utilisateur ?",
        message: user.isActive
          ? `${fullName} ne pourra plus se connecter tant que le compte est désactivé.`
          : `${fullName} pourra à nouveau accéder à l'application.`,
        confirmLabel: user.isActive ? "Désactiver" : "Activer",
        variant: user.isActive ? "warning" : "default",
      },
      loadingMessage: "Mise à jour du statut...",
      success: {
        title: user.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
        message: fullName,
      },
      error: {
        title: "Action impossible",
        message:
          "Le statut n'a pas pu être modifié. Vérifiez que vous ne modifiez pas votre propre compte de façon interdite.",
      },
      action: async () => {
        await toggleStatusMutation.mutateAsync({
          id: user.id,
          isActive: !user.isActive,
        });
        await userQuery.refetch();
      },
    });
  };

  const handleRemove = () => {
    void runAction({
      confirm: {
        title: "Supprimer ce compte ?",
        message: `Le compte de ${fullName} sera désactivé définitivement.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression en cours...",
      success: {
        title: "Compte supprimé",
        message: fullName,
      },
      redirectTo: "/utilisateurs",
      redirectMessage: "Retour à la liste des utilisateurs...",
      error: {
        title: "Suppression impossible",
        message:
          "Ce compte ne peut pas être supprimé. Vérifiez qu'il ne s'agit pas de votre propre compte ou du dernier administrateur.",
      },
      action: () => removeMutation.mutateAsync(user.id),
    });
  };

  return (
    <RequireUserAccess>
      <div className="space-y-6">
        <Link
          href="/utilisateurs"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {fullName}
            </h1>
            <p className="text-sm text-gray-500">Fiche utilisateur et permissions.</p>
          </div>

          {canManageUsers ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/utilisateurs/${user.id}/modifier`}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                Modifier
              </Link>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleToggleStatus}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {user.isActive ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleRemove}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:hover:bg-red-500/10"
              >
                Supprimer
              </button>
            </div>
          ) : null}
        </div>

        <UserDetailsCard user={user} />

        {permissionsQuery.isPending ? (
          <LoadingBlock label="Chargement des permissions..." />
        ) : null}

        {permissionsQuery.isError ? (
          <ErrorState
            title="Permissions indisponibles"
            message="Impossible de charger les permissions de cet utilisateur."
            onRetry={() => permissionsQuery.refetch()}
          />
        ) : null}

        {permissionsQuery.data ? (
          <UserPermissionsPanel permissions={permissionsQuery.data} />
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
