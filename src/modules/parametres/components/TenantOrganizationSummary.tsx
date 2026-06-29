"use client";

import Link from "next/link";
import type { TenantSettings } from "../types/settings.types";
import {
  buildTenantOrganizationFields,
  buildTenantProfileBasicFields,
} from "../utils/tenantDisplay";

type Props = {
  tenantName: string;
  tenantType: string;
  variant?: "full" | "basic";
  settings?: TenantSettings | null;
  profileFallback?: {
    legalName?: string | null;
    tradeName?: string | null;
    primaryCurrency?: string;
    companyEmail?: string | null;
  };
  canManage?: boolean;
  showManageLink?: boolean;
  isLoadingSettings?: boolean;
};

export function TenantOrganizationSummary({
  tenantName,
  tenantType,
  variant = "full",
  settings,
  profileFallback,
  canManage = false,
  showManageLink = true,
  isLoadingSettings = false,
}: Props) {
  const fields =
    variant === "basic"
      ? buildTenantProfileBasicFields(
          { name: tenantName, type: tenantType },
          profileFallback,
        )
      : buildTenantOrganizationFields(
          { name: tenantName, type: tenantType },
          settings,
          profileFallback,
        );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Mon organisation
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Informations légales et coordonnées de votre entreprise.
          </p>
        </div>
        {showManageLink && canManage ? (
          <Link
            href="/parametres/entreprise"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Modifier l&apos;entreprise
          </Link>
        ) : null}
      </div>

      {isLoadingSettings ? (
        <p className="text-sm text-gray-500">Chargement des informations...</p>
      ) : null}

      {variant === "basic" ? (
        <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
          Aperçu de votre organisation. Les informations légales complètes sont
          gérées dans les paramètres par un administrateur.
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
          >
            <dt className="text-xs font-medium text-gray-500">{field.label}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-white/90">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
