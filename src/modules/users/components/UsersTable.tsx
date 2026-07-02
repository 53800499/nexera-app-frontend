"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { UserSummary } from "../types/user.types";
import { formatUserDate, getUserFullName } from "../utils/userFormatters";
import { UserStatusBadge } from "./UserStatusBadge";

type Props = {
  users: UserSummary[];
  canManage?: boolean;
  isBusy?: boolean;
  onToggleStatus: (user: UserSummary) => void;
  onRemove: (user: UserSummary) => void;
};

export function UsersTable({
  users,
  canManage = true,
  isBusy = false,
  onToggleStatus,
  onRemove,
}: Props) {
  const columns: DataTableColumn<UserSummary>[] = [
    {
      key: "name",
      header: "Utilisateur",
      render: (user) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {getUserFullName(user)}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Rôles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.length === 0
            ? "—"
            : user.roles.map((roleItem) => (
                <span
                  key={roleItem.role.id}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {roleItem.role.name}
                </span>
              ))}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatUserDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (user) => <UserStatusBadge isActive={user.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/utilisateurs/${user.id}`}
            className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Voir
          </Link>
          {canManage ? (
            <>
              <Link
                href={`/utilisateurs/${user.id}/modifier`}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Modifier
              </Link>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onToggleStatus(user)}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {user.isActive ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onRemove(user)}
                className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:hover:bg-red-500/10"
              >
                Supprimer
              </button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[960px]">
          <DataTable<UserSummary>
            data={users}
            columns={columns}
            rowKey={(user) => user.id}
            emptyState={
              <EmptyState
                title="Aucun utilisateur"
                description="Commencez par créer un premier utilisateur pour ce tenant."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/utilisateurs/nouveau"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Créer un utilisateur
                    </Link>
                  ) : undefined
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
