"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/icons";
import { groupProfilePermissionCodes } from "../utils/permissionDisplay";

type Props = {
  permissions: string[];
};

export function ProfilePermissionsSection({ permissions }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const permissionGroups = groupProfilePermissionCodes(permissions);

  if (permissions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <p className="text-xs font-medium text-gray-500">Permissions</p>
        <p className="mt-1 text-sm text-gray-500">
          Aucune permission directe — l&apos;accès dépend de vos rôles.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen ? "true" : "false"}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          Permissions
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({permissions.length})
          </span>
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-gray-100 px-3 py-3 dark:border-gray-800">
          {permissionGroups.map((group) => (
            <div
              key={group.group}
              className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {group.label}
                <span className="ml-1.5 font-normal text-gray-400">
                  ({group.codes.length})
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.codes.map((code) => (
                  <span
                    key={code}
                    className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    title={code}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
