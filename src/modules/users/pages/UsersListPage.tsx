"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireUserAccess } from "../components/RequireUserAccess";
import { UsersStatsBar } from "../components/UsersStatsBar";
import { UsersTable } from "../components/UsersTable";
import { useUserAccess } from "../hooks/useUserAccess";
import { useUsers } from "../hooks/useUsers";
import type { UserSummary } from "../types/user.types";
import { getUserFullName } from "../utils/userFormatters";

type StatusFilter = "all" | "active" | "inactive";

export default function UsersListPage() {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { canManageUsers } = useUserAccess();
  const { usersQuery, toggleStatusMutation, removeMutation } = useUsers();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    const normalized = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalized ||
        getUserFullName(user).toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.roles.some((link) =>
          link.role.name.toLowerCase().includes(normalized),
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [usersQuery.data, query, statusFilter]);

  const stats = useMemo(() => {
    const users = usersQuery.data ?? [];
    return {
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
    };
  }, [usersQuery.data]);

  const handleToggleStatus = (user: UserSummary) => {
    const fullName = getUserFullName(user);
    void runAction({
      confirm: {
        title: user.isActive ? "Désactiver cet utilisateur ?" : "Activer cet utilisateur ?",
        message: user.isActive
          ? `${fullName} ne pourra plus se connecter.`
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
          "Le statut n'a pas pu être modifié. Vérifiez vos droits et le compte concerné.",
      },
      action: () =>
        toggleStatusMutation.mutateAsync({
          id: user.id,
          isActive: !user.isActive,
        }),
    });
  };

  const handleRemove = (user: UserSummary) => {
    const fullName = getUserFullName(user);
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Utilisateurs
            </h1>
            <p className="text-sm text-gray-500">
              Gérez les comptes, les rôles et les accès de votre organisation.
            </p>
          </div>
          {canManageUsers ? (
            <Link
              href="/utilisateurs/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouvel utilisateur
            </Link>
          ) : null}
        </div>

        {usersQuery.data ? <UsersStatsBar {...stats} /> : null}

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
          }}
        >
          <div className="min-w-[240px] flex-1">
            <Input
              placeholder="Rechercher par nom, email ou rôle..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Rechercher
          </button>
        </form>

        {usersQuery.isPending && !usersQuery.data ? (
          <LoadingBlock label="Chargement des utilisateurs..." />
        ) : null}

        {usersQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger la liste des utilisateurs. Vérifiez votre connexion puis réessayez."
            onRetry={() => usersQuery.refetch()}
          />
        ) : null}

        {usersQuery.data ? (
          <UsersTable
            users={filteredUsers}
            canManage={canManageUsers}
            isBusy={isBusy}
            onToggleStatus={handleToggleStatus}
            onRemove={handleRemove}
          />
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
