"use client";

import type { ProfileResponse } from "../types/profile.types";
import { formatProfileDate } from "../utils/profileFormatters";
import { ProfilePermissionsSection } from "./ProfilePermissionsSection";

type Props = {
  profile: ProfileResponse;
};

export function ProfileAccountSummary({ profile }: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Mon compte
      </h3>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-gray-500">Rôles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.roles.length > 0 ? (
              profile.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Aucun rôle assigné</span>
            )}
          </div>
        </div>

        <ProfilePermissionsSection permissions={profile.permissions} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500">Membre depuis</p>
            <p className="mt-1 text-sm">{formatProfileDate(profile.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500">Dernière mise à jour</p>
            <p className="mt-1 text-sm">{formatProfileDate(profile.updatedAt)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
