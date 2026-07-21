"use client";

import type { Address, ClientDetail } from "../types/client.types";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { ClientStatusBadge } from "./ClientStatusBadge";

function formatAddress(address?: Address | null) {
  if (!address) return "—";
  const country =
    address.country && /^[A-Z]{2}$/.test(address.country)
      ? new Intl.DisplayNames(["fr"], { type: "region" }).of(address.country) ??
        address.country
      : address.country;
  const parts = [
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    country,
  ].filter(Boolean);
  return parts.join(", ") || "—";
}

type Props = {
  client: ClientDetail;
};

export function ClientDetailsCard({ client }: Props) {
  const primary =
    client.contacts.find((c) => c.isPrimary) ?? client.contacts[0];
  const isCompany = client.clientType === "company";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {client.code}
          </p>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {client.companyName}
          </h2>
          {isCompany && client.tradeName ? (
            <p className="text-sm text-gray-500">{client.tradeName}</p>
          ) : null}
        </div>
        <ClientStatusBadge isArchived={client.isArchived} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs uppercase text-gray-500">Type</p>
          <p className="mt-1 text-sm">
            {client.clientType === "company" ? "Entreprise" : "Particulier"}
          </p>
        </div>
        {isCompany ? (
          <>
            <div>
              <p className="text-xs uppercase text-gray-500">SIRET / IFU</p>
              <p className="mt-1 text-sm">
                {client.siret || "—"} / {client.taxId || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Secteur</p>
              <p className="mt-1 text-sm">{client.sector || "—"}</p>
            </div>
          </>
        ) : null}
        <div>
          <p className="text-xs uppercase text-gray-500">Contact principal</p>
          <p className="mt-1 text-sm">
            {primary
              ? `${primary.firstName} ${primary.lastName}`
              : "—"}
          </p>
          <p className="text-xs text-gray-500">{primary?.email ?? ""}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Facturation</p>
          <p className="mt-1 text-sm">{formatAddress(client.billingAddress)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Livraison</p>
          <p className="mt-1 text-sm">
            {formatAddress(client.shippingAddress)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Devise / Remise</p>
          <p className="mt-1 text-sm">
            {client.defaultCurrency ?? DEFAULT_CURRENCY} · {client.defaultDiscountPct ?? 0}%
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Encours max</p>
          <p className="mt-1 text-sm">
            {client.creditLimit != null
              ? `${client.creditLimit} ${client.defaultCurrency ?? DEFAULT_CURRENCY}`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Relances</p>
          <p className="mt-1 text-sm">
            {client.remindersDisabled ? "Désactivées" : "Actives"}
          </p>
        </div>
      </div>

      {client.notes ? (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {client.notes}
        </div>
      ) : null}
    </div>
  );
}
