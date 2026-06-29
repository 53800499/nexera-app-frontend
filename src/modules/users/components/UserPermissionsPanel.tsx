"use client";

import { useState } from "react";
import type { UserPermissionsResponse } from "../types/user.types";

type Props = {
  permissions: UserPermissionsResponse;
};

export function UserPermissionsPanel({ permissions }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen ? "true" : "false"}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Permissions effectives
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {permissions.permissions.length} permission(s) via les rôles assignés
          </p>
        </div>
        <span className="text-sm text-gray-400">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen ? (
        <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="mb-3 flex flex-wrap gap-2">
            {permissions.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
              >
                {role}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {permissions.permissions.map((code) => (
              <span
                key={code}
                className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
