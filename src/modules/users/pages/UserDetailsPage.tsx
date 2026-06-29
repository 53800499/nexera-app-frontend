"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireUserAccess } from "../components/RequireUserAccess";
import { UserDetailsCard } from "../components/UserDetailsCard";
import { UserPermissionsPanel } from "../components/UserPermissionsPanel";
import { useUserAccess } from "../hooks/useUserAccess";
import { useUser, useUserPermissions, useUsers } from "../hooks/useUsers";
import { getUserFullName } from "../utils/userFormatters";

export default function UserDetailsPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
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
        message="Impossible de charger les détails de cet utilisateur."
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
              {getUserFullName(user)}
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
                onClick={() => {
                  toggleStatusMutation.mutate(
                    { id: user.id, isActive: !user.isActive },
                    {
                      onSuccess: () => {
                        toast.success(
                          user.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
                        );
                      },
                      onError: () => toast.error("Action impossible"),
                    },
                  );
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {user.isActive ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    !window.confirm(
                      `Désactiver définitivement le compte de ${getUserFullName(user)} ?`,
                    )
                  ) {
                    return;
                  }
                  removeMutation.mutate(user.id, {
                    onSuccess: () => {
                      toast.success("Compte désactivé");
                      router.push("/utilisateurs");
                    },
                    onError: () => toast.error("Suppression impossible"),
                  });
                }}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
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

        {permissionsQuery.data ? (
          <UserPermissionsPanel permissions={permissionsQuery.data} />
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
