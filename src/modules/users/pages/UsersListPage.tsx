"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Input from "@/components/form/input/InputField";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireUserAccess } from "../components/RequireUserAccess";
import { UsersStatsBar } from "../components/UsersStatsBar";
import { UsersTable } from "../components/UsersTable";
import { useUserAccess } from "../hooks/useUserAccess";
import { useUsers } from "../hooks/useUsers";
import { getUserFullName } from "../utils/userFormatters";

type StatusFilter = "all" | "active" | "inactive";

export default function UsersListPage() {
  const toast = useToast();
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
            message="Impossible de charger la liste des utilisateurs."
            onRetry={() => usersQuery.refetch()}
          />
        ) : null}

        {usersQuery.data ? (
          <UsersTable
            users={filteredUsers}
            canManage={canManageUsers}
            onToggleStatus={(user) => {
              toggleStatusMutation.mutate(
                { id: user.id, isActive: !user.isActive },
                {
                  onSuccess: () => {
                    toast.success(
                      user.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
                      getUserFullName(user),
                    );
                  },
                  onError: () => {
                    toast.error("Action impossible", "Le statut n'a pas pu être modifié.");
                  },
                },
              );
            }}
            onRemove={(user) => {
              if (
                !window.confirm(
                  `Désactiver définitivement le compte de ${getUserFullName(user)} ?`,
                )
              ) {
                return;
              }
              removeMutation.mutate(user.id, {
                onSuccess: () => {
                  toast.success("Compte désactivé", getUserFullName(user));
                },
                onError: () => {
                  toast.error("Suppression impossible", "Réessayez plus tard.");
                },
              });
            }}
          />
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
