"use client";

import { useMemo, useState } from "react";
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
import { RequireStockAccess } from "../components/RequireStockAccess";
import {
  useStockArticles,
  useStockEntries,
  useWarehouses,
} from "../hooks/useStock";
import type {
  CreateStockEntryPayload,
  StockEntryType,
  StockQualityStatus,
} from "../types/stock.types";
import {
  STOCK_ENTRY_TYPE_LABELS,
  STOCK_QUALITY_LABELS,
} from "../utils/movementLabels";

type LineDraft = {
  key: string;
  stockItemId: string;
  qtyPlanned: string;
  qtyActual: string;
  unitCost: string;
  locationId: string;
  lotNumber: string;
  manufactureDate: string;
  expiryDate: string;
  serialNumbers: string;
};

function emptyLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    stockItemId: "",
    qtyPlanned: "1",
    qtyActual: "",
    unitCost: "0",
    locationId: "",
    lotNumber: "",
    manufactureDate: "",
    expiryDate: "",
    serialNumbers: "",
  };
}

export default function CreateStockEntryPage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const articlesQuery = useStockArticles();
  const { warehousesQuery } = useWarehouses(false);
  const { createEntryMutation } = useStockEntries();

  const [movementType, setMovementType] =
    useState<StockEntryType>("IN_SUPPLIER");
  const [warehouseId, setWarehouseId] = useState("");
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState("");
  const [qualityStatus, setQualityStatus] =
    useState<StockQualityStatus>("accepted");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validateNow, setValidateNow] = useState(true);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const configuredArticles = useMemo(
    () =>
      (articlesQuery.data ?? []).filter(
        (a) => a.configured && a.stockItem && !a.isArchived,
      ),
    [articlesQuery.data],
  );

  const selectedWarehouse = (warehousesQuery.data ?? []).find(
    (w) => w.id === warehouseId,
  );

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const selectedStockItem = (stockItemId: string) =>
    configuredArticles.find((a) => a.stockItem?.id === stockItemId)?.stockItem;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: CreateStockEntryPayload = {
      movementType,
      warehouseId,
      movementDate,
      reference: reference.trim() || undefined,
      qualityStatus,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
      validate: validateNow,
      lines: lines.map((line) => {
        const qtyPlanned = Number(line.qtyPlanned);
        const qtyActual = line.qtyActual.trim()
          ? Number(line.qtyActual)
          : undefined;
        const serials = line.serialNumbers
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        return {
          stockItemId: line.stockItemId,
          qtyPlanned,
          qtyActual,
          unitCost: Number(line.unitCost),
          locationId: line.locationId || undefined,
          lotNumber: line.lotNumber.trim() || undefined,
          manufactureDate: line.manufactureDate || undefined,
          expiryDate: line.expiryDate || undefined,
          serialNumbers: serials.length ? serials : undefined,
        };
      }),
    };

    await runAction({
      loadingMessage: validateNow
        ? "Création et validation de l'entrée..."
        : "Création du brouillon...",
      success: {
        title: validateNow ? "Entrée validée" : "Brouillon créé",
      },
      error: { title: "Enregistrement impossible" },
      action: async () => {
        const movement = await createEntryMutation.mutateAsync(payload);
        router.push(`/stock/mouvements/${movement.id}`);
        return movement;
      },
      showResultOnSuccess: true,
    });
  };

  const isLoading = articlesQuery.isLoading || warehousesQuery.isLoading;

  return (
    <RequireStockAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/stock/mouvements"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Retour aux mouvements
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvelle entrée
          </h1>
          <p className="text-sm text-gray-500">
            Réception fournisseur, retour, production, ajustement ou stock
            initial (UC-S03).
          </p>
        </div>

        {isLoading && <LoadingBlock label="Chargement..." />}
        {(articlesQuery.isError || warehousesQuery.isError) && (
          <ErrorState
            title="Données indisponibles"
            message="Impossible de charger articles ou entrepôts."
          />
        )}

        {!isLoading && configuredArticles.length === 0 ? (
          <ErrorState
            title="Aucun article configuré"
            message="Configurez d'abord la fiche stock d'au moins un article produit."
            action={
              <Link
                href="/stock/articles"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Aller aux articles
              </Link>
            }
          />
        ) : null}

        {!isLoading && configuredArticles.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 dark:border-gray-800">
              <div>
                <Label>Type d&apos;entrée</Label>
                <select
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(e.target.value as StockEntryType)
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {Object.entries(STOCK_ENTRY_TYPE_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <Label>Entrepôt destination</Label>
                <select
                  value={warehouseId}
                  onChange={(e) => {
                    setWarehouseId(e.target.value);
                    setLines((prev) =>
                      prev.map((l) => ({ ...l, locationId: "" })),
                    );
                  }}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir —</option>
                  {(warehousesQuery.data ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                      {w.isDefault ? " (défaut)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date de réception</Label>
                <Input
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Référence (BL fournisseur…)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="BL-2026-001"
                />
              </div>
              <div>
                <Label>Contrôle qualité</Label>
                <select
                  value={qualityStatus}
                  onChange={(e) =>
                    setQualityStatus(e.target.value as StockQualityStatus)
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {Object.entries(STOCK_QUALITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {movementType === "IN_ADJUSTMENT" ? (
                <div className="md:col-span-2">
                  <Label>Motif (obligatoire)</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Écart inventaire…"
                  />
                </div>
              ) : null}
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

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Lignes
                </h2>
                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, emptyLine()])}
                  className="text-sm font-medium text-brand-600"
                >
                  + Ajouter une ligne
                </button>
              </div>

              {lines.map((line, index) => {
                const item = selectedStockItem(line.stockItemId);
                return (
                  <div
                    key={line.key}
                    className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ligne {index + 1}
                      </span>
                      {lines.length > 1 ? (
                        <button
                          type="button"
                          className="text-xs text-red-600"
                          onClick={() =>
                            setLines((prev) =>
                              prev.filter((l) => l.key !== line.key),
                            )
                          }
                        >
                          Retirer
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label>Article</Label>
                        <select
                          value={line.stockItemId}
                          onChange={(e) =>
                            updateLine(line.key, {
                              stockItemId: e.target.value,
                            })
                          }
                          required
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="">— Choisir —</option>
                          {configuredArticles.map((a) => (
                            <option key={a.stockItem!.id} value={a.stockItem!.id}>
                              {a.reference} — {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Qté reçue</Label>
                        <Input
                          type="number"
                          min="0.0001"
                          step="any"
                          value={line.qtyPlanned}
                          onChange={(e) =>
                            updateLine(line.key, { qtyPlanned: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Qté acceptée (si partielle)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={line.qtyActual}
                          onChange={(e) =>
                            updateLine(line.key, { qtyActual: e.target.value })
                          }
                          placeholder="= qté reçue"
                        />
                      </div>
                      <div>
                        <Label>Coût unitaire</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={line.unitCost}
                          onChange={(e) =>
                            updateLine(line.key, { unitCost: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Emplacement</Label>
                        <select
                          value={line.locationId}
                          onChange={(e) =>
                            updateLine(line.key, {
                              locationId: e.target.value,
                            })
                          }
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="">— Aucun —</option>
                          {(selectedWarehouse?.locations ?? [])
                            .filter((l) => l.isActive)
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.code}
                              </option>
                            ))}
                        </select>
                      </div>
                      {item?.trackLots ? (
                        <>
                          <div>
                            <Label>N° de lot</Label>
                            <Input
                              value={line.lotNumber}
                              onChange={(e) =>
                                updateLine(line.key, {
                                  lotNumber: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Date fabrication</Label>
                            <Input
                              type="date"
                              value={line.manufactureDate}
                              onChange={(e) =>
                                updateLine(line.key, {
                                  manufactureDate: e.target.value,
                                })
                              }
                            />
                          </div>
                          {item.trackExpiry ? (
                            <div>
                              <Label>Date péremption</Label>
                              <Input
                                type="date"
                                value={line.expiryDate}
                                onChange={(e) =>
                                  updateLine(line.key, {
                                    expiryDate: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {item?.trackSerials ? (
                        <div className="md:col-span-2">
                          <Label>N° de série (un par ligne / séparés)</Label>
                          <textarea
                            value={line.serialNumbers}
                            onChange={(e) =>
                              updateLine(line.key, {
                                serialNumbers: e.target.value,
                              })
                            }
                            rows={3}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-900"
                            placeholder={"SN001\nSN002"}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </section>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={validateNow}
                onChange={(e) => setValidateNow(e.target.checked)}
              />
              Valider immédiatement (met à jour le stock et le CMUP)
            </label>

            <div className="flex justify-end">
              <Button disabled={isBusy || !warehouseId}>
                {isBusy
                  ? "Enregistrement..."
                  : validateNow
                    ? "Créer et valider"
                    : "Enregistrer en brouillon"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
