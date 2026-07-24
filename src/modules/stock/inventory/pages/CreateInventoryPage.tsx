"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useWarehouses } from "../../hooks/useStock";
import { useInventories } from "../hooks/useInventory";
import type { InventorySessionType } from "../types/inventory.types";
import { INVENTORY_TYPE_LABELS } from "../utils/inventoryLabels";

export default function CreateInventoryPage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { warehousesQuery } = useWarehouses(false);
  const { createMutation } = useInventories();

  const [type, setType] = useState<InventorySessionType>("total");
  const [warehouseId, setWarehouseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [plannedDate, setPlannedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [freezeMovements, setFreezeMovements] = useState(true);
  const [varianceThresholdQty, setVarianceThresholdQty] = useState("0");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction({
      loadingMessage: "Création de la session...",
      success: { title: "Inventaire créé" },
      error: { title: "Création impossible" },
      action: async () => {
        const session = await createMutation.mutateAsync({
          type,
          warehouseId,
          categoryId:
            type === "partial" && categoryId.trim()
              ? categoryId.trim()
              : undefined,
          plannedDate: plannedDate || undefined,
          freezeMovements,
          varianceThresholdQty: Number(varianceThresholdQty) || 0,
          notes: notes.trim() || undefined,
        });
        router.push(`/stock/inventaires/${session.id}`);
        return session;
      },
    });
  };

  if (warehousesQuery.isLoading) {
    return (
      <RequireStockAccess requireManage>
        <LoadingBlock label="Chargement..." />
      </RequireStockAccess>
    );
  }

  return (
    <RequireStockAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/stock/inventaires"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Retour aux inventaires
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvel inventaire
          </h1>
          <p className="text-sm text-gray-500">
            Définir le périmètre et générer les feuilles de comptage (UC-S06).
          </p>
        </div>

        {warehousesQuery.isError && (
          <ErrorState
            title="Entrepôts indisponibles"
            message="Impossible de charger les entrepôts."
            onRetry={() => warehousesQuery.refetch()}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 dark:border-gray-800">
            <div>
              <Label>Type</Label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as InventorySessionType)
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                {Object.entries(INVENTORY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Entrepôt</Label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">— Choisir —</option>
                {(warehousesQuery.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.name}
                  </option>
                ))}
              </select>
            </div>
            {type === "partial" ? (
              <div className="md:col-span-2">
                <Label>ID catégorie catalogue (périmètre partiel)</Label>
                <Input
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  placeholder="UUID de la catégorie"
                />
              </div>
            ) : null}
            <div>
              <Label>Date prévue</Label>
              <Input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Seuil écart qté (double comptage — RM-INV03)</Label>
              <Input
                type="number"
                min="0"
                step="any"
                value={varianceThresholdQty}
                onChange={(e) => setVarianceThresholdQty(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">
                0 = tout écart déclenche un second comptage.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={freezeMovements}
                  onChange={(e) => setFreezeMovements(e.target.checked)}
                />
                Geler les mouvements sur l&apos;entrepôt pendant le comptage
                (RM-INV01)
              </label>
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button disabled={isBusy || !warehouseId}>
              {isBusy ? "Création..." : "Créer la session"}
            </Button>
          </div>
        </form>
      </div>
    </RequireStockAccess>
  );
}
