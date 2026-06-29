"use client";

import type { Role } from "../types/role.types";

type Props = {
  role: Role;
};

export function RoleDetailsCard({ role }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Nom</p>
          <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
            {role.name}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Code</p>
          <p className="mt-1 font-mono text-sm text-gray-800 dark:text-white/90">
            {role.code}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Description
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {role.description || "Aucune description"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Permissions actives
          </p>
          <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
            {role.permissions.length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Créé le
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {new Date(role.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  );
}
