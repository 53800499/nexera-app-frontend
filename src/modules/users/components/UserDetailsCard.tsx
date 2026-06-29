import type { UserSummary } from "../types/user.types";
import { formatUserDate, getUserFullName } from "../utils/userFormatters";
import { UserStatusBadge } from "./UserStatusBadge";

export function UserDetailsCard({ user }: { user: UserSummary }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {getUserFullName(user)}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>
        <UserStatusBadge isActive={user.isActive} />
      </div>

      <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <dt className="text-xs font-medium text-gray-500">Organisation</dt>
          <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
            {user.tenant?.name ?? user.tenantId}
          </dd>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <dt className="text-xs font-medium text-gray-500">Membre depuis</dt>
          <dd className="mt-1 text-sm">{formatUserDate(user.createdAt)}</dd>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <dt className="text-xs font-medium text-gray-500">
            Dernière mise à jour
          </dt>
          <dd className="mt-1 text-sm">{formatUserDate(user.updatedAt)}</dd>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <dt className="text-xs font-medium text-gray-500">Rôles</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {user.roles.length === 0 ? (
              <span className="text-sm text-gray-500">Aucun rôle assigné</span>
            ) : (
              user.roles.map((link) => (
                <span
                  key={link.role.id}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {link.role.name}
                </span>
              ))
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
