import type { CatalogItem } from "../types/catalogue.types";
import {
  formatPriceHt,
  ITEM_TYPE_LABELS,
} from "../utils/catalogueLabels";
import { CatalogItemStatusBadge } from "./CatalogItemStatusBadge";

type Props = {
  item: CatalogItem;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-800 dark:text-white/90">{children}</p>
    </div>
  );
}

export function CatalogItemDetailsCard({ item }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {item.name}
          </h2>
          <p className="text-sm text-gray-500">{item.reference}</p>
        </div>
        <CatalogItemStatusBadge isArchived={item.isArchived} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Type">{ITEM_TYPE_LABELS[item.itemType]}</Field>
        <Field label="Catégorie">{item.category?.name ?? "—"}</Field>
        <Field label="Unité">{item.unit}</Field>
        <Field label="Prix HT">{formatPriceHt(item.priceHt)}</Field>
        <Field label="TVA">
          {item.taxRate
            ? `${item.taxRate.name} (${item.taxRate.rate}%)`
            : "—"}
        </Field>
        <Field label="Remise max.">
          {item.maxDiscountPct != null ? `${item.maxDiscountPct}%` : "—"}
        </Field>
      </div>

      {item.description ? (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Field label="Description">{item.description}</Field>
        </div>
      ) : null}
    </div>
  );
}
