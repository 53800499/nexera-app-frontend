"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { Role } from "../types/role.types";

type Props = {
  roles: Role[];
  canManage: boolean;
  onDelete: (role: Role) => void;
  isDeleting?: boolean;
};

export function RolesTable({ roles, canManage, onDelete, isDeleting }: Props) {
  const columns: DataTableColumn<Role>[] = [
    {
      key: "name",
      header: "Rôle",
      render: (role) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {role.name}
          </p>
          <p className="text-xs text-gray-500">{role.code}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (role) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {role.description || "—"}
        </span>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role) => (
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          {role.permissions.length}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (role) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/roles/${role.id}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Détail
          </Link>
          {canManage ? (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(role)}
              className="rounded border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-50 dark:border-error-500/40 dark:text-error-400"
            >
              Supprimer
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <DataTable<Role>
            data={roles}
            columns={columns}
            rowKey={(role) => role.id}
            emptyState={
              <EmptyState
                title="Aucun rôle"
                description="Créez un premier rôle pour structurer les droits de votre équipe."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/roles/nouveau"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Créer un rôle
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
