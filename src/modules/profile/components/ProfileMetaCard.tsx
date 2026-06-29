"use client";

import Image from "next/image";
import { getUserDisplayName } from "@/modules/auth";
import { UserStatusBadge } from "@/modules/users/components/UserStatusBadge";
import type { ProfileResponse } from "../types/profile.types";
import { TENANT_TYPE_LABELS } from "@/modules/parametres/utils/tenantDisplay";

type Props = {
  profile: ProfileResponse;
};

export function ProfileMetaCard({ profile }: Props) {
  const displayName = getUserDisplayName(profile);
  const tenantTypeLabel =
    TENANT_TYPE_LABELS[profile.tenant.type] ?? profile.tenant.type;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <Image
            width={80}
            height={80}
            src="/images/user/owner1.jpg"
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {displayName}
            </h2>
            <UserStatusBadge isActive={profile.isActive} />
            {profile.isSuperAdmin ? (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10">
                Super admin
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {profile.tenant.name}
            </span>{" "}
            · {tenantTypeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
