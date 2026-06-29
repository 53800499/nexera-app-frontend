"use client";

import Link from "next/link";
import { ErrorState } from "@/shared/components/feedback";
import { useCatalogItemPrices } from "../hooks/useCatalogue";
import type { CatalogItemPrice } from "../types/catalogue.types";
import { formatPriceHt } from "../utils/catalogueLabels";
import { priceTargetLabel } from "../utils/catalogPriceMappers";

type Props = {
  itemId: string;
  canManage: boolean;
};

function PriceRow({
  price,
  itemId,
  canManage,
}: {
  price: CatalogItemPrice;
  itemId: string;
  canManage: boolean;
}) {
  return (
    <tr className="border-t border-gray-100 dark:border-gray-800">
      <td className="px-4 py-3 text-sm">{priceTargetLabel(price)}</td>
      <td className="px-4 py-3 text-sm">
        {formatPriceHt(price.priceHt, price.currency)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {price.validFrom
          ? new Date(price.validFrom).toLocaleDateString("fr-FR")
          : "—"}
        {" → "}
        {price.validTo
          ? new Date(price.validTo).toLocaleDateString("fr-FR")
          : "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            price.isActive
              ? "bg-success-50 text-success-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {price.isActive ? "Actif" : "Inactif"}
        </span>
      </td>
      {canManage ? (
        <td className="px-4 py-3">
          <Link
            href={`/catalogue/${itemId}/tarifs/${price.id}/modifier`}
            className="rounded border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
          >
            Modifier
          </Link>
        </td>
      ) : null}
    </tr>
  );
}

export function CatalogItemPricesSection({ itemId, canManage }: Props) {
  const { pricesQuery } = useCatalogItemPrices(itemId);
  const prices = pricesQuery.data ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Tarifs spécifiques
          </h3>
          <p className="text-sm text-gray-500">
            Tarifs par client ou groupe (RM-A05).
          </p>
        </div>
        {canManage ? (
          <Link
            href={`/catalogue/${itemId}/tarifs/nouveau`}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ajouter un tarif
          </Link>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3">Cible</th>
              <th className="px-4 py-3">Prix HT</th>
              <th className="px-4 py-3">Validité</th>
              <th className="px-4 py-3">Statut</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 5 : 4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Aucun tarif spécifique — le prix catalogue s&apos;applique.
                </td>
              </tr>
            ) : (
              prices.map((price) => (
                <PriceRow
                  key={price.id}
                  price={price}
                  itemId={itemId}
                  canManage={canManage}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {pricesQuery.isError ? (
        <div className="p-5">
          <ErrorState
            title="Tarifs indisponibles"
            message="Impossible de charger les tarifs de cet article."
            onRetry={() => pricesQuery.refetch()}
          />
        </div>
      ) : null}
    </div>
  );
}
