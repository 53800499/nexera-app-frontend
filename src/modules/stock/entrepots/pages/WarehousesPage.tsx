"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { useStockAccess } from "../../hooks/useStockAccess";
import { useWarehouses } from "../../hooks/useStock";
import { buildLocationCodePreview } from "../utils/locationCode";
import type { Warehouse } from "../../types/stock.types";

export default function WarehousesPage() {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const {
    warehousesQuery,
    createWarehouseMutation,
    setDefaultMutation,
    archiveMutation,
    reactivateMutation,
    createLocationMutation,
    updateLocationMutation,
  } = useWarehouses(true);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [locationWarehouseId, setLocationWarehouseId] = useState("");
  const [zone, setZone] = useState("");
  const [aisle, setAisle] = useState("");
  const [rack, setRack] = useState("");
  const [bin, setBin] = useState("");
  const [capacity, setCapacity] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedWarehouse = useMemo(
    () =>
      (warehousesQuery.data ?? []).find((w) => w.id === locationWarehouseId),
    [warehousesQuery.data, locationWarehouseId],
  );

  const codePreview = buildLocationCodePreview({
    warehouseCode: selectedWarehouse?.code ?? "",
    zone,
    aisle,
    rack,
    bin,
  });

  const activeWarehouses = (warehousesQuery.data ?? []).filter((w) => w.isActive);

  const handleCreateWarehouse = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction({
      loadingMessage: "Création de l'entrepôt...",
      success: { title: "Entrepôt créé" },
      error: { title: "Création impossible" },
      action: async () => {
        await createWarehouseMutation.mutateAsync({
          code,
          name,
          isDefault,
        });
        setCode("");
        setName("");
        setIsDefault(false);
      },
    });
  };

  const handleCreateLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationWarehouseId) return;
    await runAction({
      loadingMessage: "Création de l'emplacement...",
      success: {
        title: "Emplacement créé",
        message: codePreview || undefined,
      },
      error: { title: "Création impossible" },
      action: async () => {
        await createLocationMutation.mutateAsync({
          warehouseId: locationWarehouseId,
          payload: {
            zone,
            aisle,
            rack,
            bin,
            capacity: capacity.trim() ? Number(capacity) : undefined,
          },
        });
        setZone("");
        setAisle("");
        setRack("");
        setBin("");
        setCapacity("");
        setExpandedId(locationWarehouseId);
      },
    });
  };

  const handleSetDefault = (warehouse: Warehouse) => {
    void runAction({
      confirm: {
        title: "Entrepôt par défaut ?",
        message: `Désigner « ${warehouse.name} » comme entrepôt par défaut pour les sorties et inventaires (RM-E03).`,
        confirmLabel: "Désigner",
      },
      loadingMessage: "Mise à jour...",
      success: { title: "Entrepôt par défaut mis à jour" },
      error: { title: "Action impossible" },
      action: () => setDefaultMutation.mutateAsync(warehouse.id),
    });
  };

  const handleArchive = (warehouse: Warehouse) => {
    void runAction({
      confirm: {
        title: "Archiver cet entrepôt ?",
        message:
          "Un entrepôt avec du stock ne peut pas être archivé. Transférez d'abord le stock (RM-E02).",
        confirmLabel: "Archiver",
        variant: "danger",
      },
      loadingMessage: "Archivage...",
      success: { title: "Entrepôt archivé" },
      error: { title: "Archivage impossible" },
      action: () => archiveMutation.mutateAsync(warehouse.id),
    });
  };

  const handleReactivate = (warehouse: Warehouse) => {
    void runAction({
      loadingMessage: "Réactivation...",
      success: { title: "Entrepôt réactivé" },
      error: { title: "Réactivation impossible" },
      action: () => reactivateMutation.mutateAsync(warehouse.id),
    });
  };

  const handleToggleLocationActive = (
    warehouseId: string,
    locationId: string,
    isActive: boolean,
  ) => {
    void runAction({
      loadingMessage: isActive ? "Désactivation..." : "Réactivation...",
      success: {
        title: isActive ? "Emplacement désactivé" : "Emplacement réactivé",
      },
      error: { title: "Action impossible" },
      action: () =>
        updateLocationMutation.mutateAsync({
          warehouseId,
          locationId,
          payload: { isActive: !isActive },
        }),
    });
  };

  return (
    <RequireStockAccess>
      <div className="space-y-6">
        <Link
          href="/stock/articles"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux articles
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Entrepôts & emplacements
          </h1>
          <p className="text-sm text-gray-500">
            Structure physique : entrepôt → zone → allée → rayon → case (UC-S02).
          </p>
        </div>

        {warehousesQuery.isLoading && (
          <LoadingBlock label="Chargement des entrepôts..." />
        )}

        {warehousesQuery.isError && (
          <ErrorState
            title="Impossible de charger les entrepôts"
            message="Une erreur est survenue."
            onRetry={() => warehousesQuery.refetch()}
          />
        )}

        {warehousesQuery.data ? (
          <div className="space-y-3">
            {warehousesQuery.data.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun entrepôt. Le premier créé devient automatiquement
                l&apos;entrepôt par défaut (RM-E03).
              </p>
            ) : (
              warehousesQuery.data.map((warehouse) => {
                const isExpanded = expandedId === warehouse.id;
                return (
                  <div
                    key={warehouse.id}
                    className={`rounded-xl border p-4 dark:border-gray-800 ${
                      warehouse.isActive
                        ? "border-gray-200"
                        : "border-dashed border-gray-300 opacity-75"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : warehouse.id)
                        }
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">
                            {warehouse.code}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {warehouse.name}
                          </span>
                          {warehouse.isDefault ? (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                              Par défaut
                            </span>
                          ) : null}
                          {!warehouse.isActive ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                              Archivé
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {warehouse.locations?.length ?? 0} emplacement(s) —{" "}
                          {isExpanded ? "réduire" : "voir la hiérarchie"}
                        </p>
                      </button>

                      {canManageStock ? (
                        <div className="flex flex-wrap gap-2">
                          {warehouse.isActive && !warehouse.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(warehouse)}
                              disabled={isBusy}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                              Définir par défaut
                            </button>
                          ) : null}
                          {warehouse.isActive && !warehouse.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleArchive(warehouse)}
                              disabled={isBusy}
                              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                            >
                              Archiver
                            </button>
                          ) : null}
                          {!warehouse.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleReactivate(warehouse)}
                              disabled={isBusy}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                              Réactiver
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 overflow-x-auto">
                        {(warehouse.locations?.length ?? 0) === 0 ? (
                          <p className="text-xs text-gray-400">
                            Aucun emplacement. Ajoutez zone / allée / rayon /
                            case ci-dessous.
                          </p>
                        ) : (
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500">
                                <th className="pb-2 pr-3 font-medium">Code</th>
                                <th className="pb-2 pr-3 font-medium">Zone</th>
                                <th className="pb-2 pr-3 font-medium">Allée</th>
                                <th className="pb-2 pr-3 font-medium">Rayon</th>
                                <th className="pb-2 pr-3 font-medium">Case</th>
                                <th className="pb-2 pr-3 font-medium">Capacité</th>
                                <th className="pb-2 font-medium">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {warehouse.locations!.map((loc) => (
                                <tr key={loc.id}>
                                  <td className="py-2 pr-3 font-mono text-gray-700 dark:text-gray-300">
                                    {loc.code}
                                  </td>
                                  <td className="py-2 pr-3">{loc.zone}</td>
                                  <td className="py-2 pr-3">{loc.aisle}</td>
                                  <td className="py-2 pr-3">{loc.rack}</td>
                                  <td className="py-2 pr-3">{loc.bin}</td>
                                  <td className="py-2 pr-3">
                                    {loc.capacity ?? "—"}
                                  </td>
                                  <td className="py-2">
                                    {canManageStock && warehouse.isActive ? (
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() =>
                                          handleToggleLocationActive(
                                            warehouse.id,
                                            loc.id,
                                            loc.isActive,
                                          )
                                        }
                                        className={
                                          loc.isActive
                                            ? "text-emerald-600 hover:underline"
                                            : "text-amber-600 hover:underline"
                                        }
                                      >
                                        {loc.isActive ? "Actif" : "Inactif"}
                                      </button>
                                    ) : (
                                      <span
                                        className={
                                          loc.isActive
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                        }
                                      >
                                        {loc.isActive ? "Actif" : "Inactif"}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {canManageStock ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <form
              onSubmit={handleCreateWarehouse}
              className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Nouvel entrepôt
              </h2>
              <div>
                <Label>Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={20}
                  placeholder="ENTCOT"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Non modifiable après création.
                </p>
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Entrepôt principal Cotonou"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Entrepôt par défaut (sorties & inventaires)
              </label>
              <Button disabled={isBusy}>Créer l&apos;entrepôt</Button>
            </form>

            <form
              onSubmit={handleCreateLocation}
              className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Nouvel emplacement
              </h2>
              <div>
                <Label>Entrepôt</Label>
                <select
                  value={locationWarehouseId}
                  onChange={(e) => setLocationWarehouseId(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir —</option>
                  {activeWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Zone</Label>
                  <Input
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    required
                    placeholder="A"
                  />
                </div>
                <div>
                  <Label>Allée</Label>
                  <Input
                    value={aisle}
                    onChange={(e) => setAisle(e.target.value)}
                    required
                    placeholder="01"
                  />
                </div>
                <div>
                  <Label>Rayon</Label>
                  <Input
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    required
                    placeholder="02"
                  />
                </div>
                <div>
                  <Label>Case</Label>
                  <Input
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    required
                    placeholder="C3"
                  />
                </div>
              </div>
              <div>
                <Label>Capacité (optionnel)</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs dark:bg-gray-900">
                <span className="text-gray-500">Code généré (RM-E01) : </span>
                <span className="font-mono font-medium text-gray-800 dark:text-white/90">
                  {codePreview || "—"}
                </span>
              </div>
              <Button
                disabled={
                  isBusy || !locationWarehouseId || !codePreview
                }
              >
                Créer l&apos;emplacement
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
