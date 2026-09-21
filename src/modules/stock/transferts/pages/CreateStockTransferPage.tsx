"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  useAvailableLots,
  useAvailableSerials,
  useStockArticles,
  useStockTransfers,
  useWarehouses,
} from "../../hooks/useStock";
import type {
  CreateStockTransferPayload,
  StockArticleRow,
  Warehouse,
} from "../../types/stock.types";

type LineDraft = {
  key: string;
  stockItemId: string;
  qty: string;
  lotId: string;
  sourceLocationId: string;
  destLocationId: string;
  serialNumbers: string;
};

function emptyLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    stockItemId: "",
    qty: "1",
    lotId: "",
    sourceLocationId: "",
    destLocationId: "",
    serialNumbers: "",
  };
}

function TransferLineFields({
  line,
  allLines,
  sourceWarehouseId,
  destWarehouse,
  configuredArticles,
  onChange,
  onRemove,
  canRemove,
  index,
  onValidationChange,
}: {
  line: LineDraft;
  allLines: LineDraft[];
  sourceWarehouseId: string;
  destWarehouse: Warehouse | undefined;
  configuredArticles: StockArticleRow[];
  onChange: (patch: Partial<LineDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
  onValidationChange: (key: string, error: string | null) => void;
}) {
  const item = configuredArticles.find(
    (a) => a.stockItem?.id === line.stockItemId,
  )?.stockItem;

  const lotsQuery = useAvailableLots(line.stockItemId, sourceWarehouseId);
  const serialsQuery = useAvailableSerials(line.stockItemId, sourceWarehouseId);

  const levels = lotsQuery.data?.levels ?? [];
  const totalWarehouseAvailable = levels.reduce(
    (sum, l) => sum + (Number(l.qtyAvailable) || 0),
    0,
  );
  const selectedLotLevel = line.lotId
    ? levels.find((l) => l.lotId === line.lotId)
    : null;
  const availableForLine = line.lotId
    ? Number(selectedLotLevel?.qtyAvailable) || 0
    : totalWarehouseAvailable;

  // Calcul du cumul demandé sur les autres lignes pour le même article et même lot
  const otherLinesRequested = allLines
    .filter(
      (l) =>
        l.key !== line.key &&
        l.stockItemId === line.stockItemId &&
        (!line.lotId || l.lotId === line.lotId),
    )
    .reduce((sum, l) => sum + (Number(l.qty) || 0), 0);

  const remainingForThisLine = Math.max(
    0,
    availableForLine - otherLinesRequested,
  );

  const parsedSerials = line.serialNumbers
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const availableList = serialsQuery.data?.serials ?? [];
  const targetQty = Math.round(Number(line.qty) || 0);
  const enteredQty = Number(line.qty) || 0;

  const isZeroStock =
    Boolean(line.stockItemId && sourceWarehouseId) &&
    !lotsQuery.isLoading &&
    availableForLine <= 0;

  const isOverStock =
    Boolean(line.stockItemId && sourceWarehouseId) &&
    !lotsQuery.isLoading &&
    !item?.allowNegativeStock &&
    enteredQty > remainingForThisLine;

  const duplicateSerials = parsedSerials.filter(
    (sn, idx, arr) => arr.indexOf(sn) !== idx,
  );

  const unavailableSerials =
    availableList.length > 0
      ? parsedSerials.filter(
          (sn) =>
            !availableList.some((s) => s.serialNumber.toUpperCase() === sn),
        )
      : [];

  const sourceLocations =
    levels
      .filter((l) => l.locationId)
      .map((l) => ({ id: l.locationId!, code: l.locationCode ?? "" })) ?? [];
  const uniqueSourceLocs = Array.from(
    new Map(sourceLocations.map((l) => [l.id, l])).values(),
  );

  // Validation en temps réel envoyée au composant parent
  useEffect(() => {
    let error: string | null = null;
    if (!line.stockItemId) {
      error = "Veuillez choisir un article";
    } else if (enteredQty <= 0) {
      error = "La quantité doit être supérieure à 0";
    } else if (isZeroStock && !item?.allowNegativeStock) {
      error = "Stock épuisé dans l'entrepôt source";
    } else if (isOverStock && !item?.allowNegativeStock) {
      error = "Quantité supérieure au stock disponible dans l'entrepôt source";
    } else if (item?.trackLots && !line.lotId) {
      error = "Veuillez choisir un lot source";
    } else if (item?.trackSerials && parsedSerials.length !== targetQty) {
      error = "Numéros de série non conformes à la quantité";
    } else if (item?.trackSerials && duplicateSerials.length > 0) {
      error = `Numéro de série dupliqué : ${duplicateSerials[0]}`;
    }
    onValidationChange(line.key, error);
  }, [
    line.key,
    line.stockItemId,
    enteredQty,
    isZeroStock,
    isOverStock,
    item?.allowNegativeStock,
    item?.trackLots,
    item?.trackSerials,
    line.lotId,
    parsedSerials.length,
    targetQty,
    duplicateSerials,
    onValidationChange,
  ]);

  const toggleSerial = (sn: string) => {
    const upper = sn.trim().toUpperCase();
    if (parsedSerials.includes(upper)) {
      const next = parsedSerials.filter((s) => s !== upper);
      onChange({ serialNumbers: next.join("\n") });
    } else {
      if (parsedSerials.length >= targetQty) return;
      const next = [...parsedSerials, upper];
      onChange({ serialNumbers: next.join("\n") });
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Ligne {index + 1}
        </span>
        {canRemove ? (
          <button
            type="button"
            className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
            onClick={onRemove}
          >
            Retirer
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Article à transférer</Label>
          <select
            value={line.stockItemId}
            onChange={(e) =>
              onChange({
                stockItemId: e.target.value,
                lotId: "",
                sourceLocationId: "",
                serialNumbers: "",
              })
            }
            required
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">— Choisir un article —</option>
            {(configuredArticles ?? []).map((a) => (
              <option key={a.stockItem!.id} value={a.stockItem!.id}>
                {a.reference} — {a.name}
              </option>
            ))}
          </select>

          {/* Indicateur de stock en temps réel dans l'entrepôt source */}
          {line.stockItemId ? (
            !sourceWarehouseId ? (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Sélectionnez un entrepôt source ci-dessus pour vérifier la disponibilité.
              </p>
            ) : lotsQuery.isLoading ? (
              <p className="mt-1.5 animate-pulse text-xs text-gray-500">
                Vérification du stock disponible dans l&apos;entrepôt source...
              </p>
            ) : availableForLine > 0 ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>
                    Stock source disponible :{" "}
                    <strong className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {availableForLine}
                    </strong>{" "}
                    {item?.storageUnit || "unité(s)"}
                  </span>
                </div>
                {otherLinesRequested > 0 ? (
                  <span className="text-gray-600 dark:text-gray-400">
                    ({otherLinesRequested} réservé sur d&apos;autres lignes, restant pour cette ligne : {remainingForThisLine})
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>
                  Rupture de stock : 0 unité disponible dans l&apos;entrepôt source pour cet article.
                  {item?.allowNegativeStock ? " (Stock négatif toléré pour cet article)" : " Transfert impossible."}
                </span>
              </div>
            )
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Quantité à transférer</Label>
            {Boolean(line.stockItemId && sourceWarehouseId && remainingForThisLine > 0) ? (
              <button
                type="button"
                onClick={() => onChange({ qty: String(remainingForThisLine) })}
                className="text-xs font-medium text-primary hover:underline"
              >
                Max ({remainingForThisLine} {item?.storageUnit || "u."})
              </button>
            ) : null}
          </div>
          <Input
            type="number"
            min="0.0001"
            step="any"
            value={line.qty}
            onChange={(e) => onChange({ qty: e.target.value })}
            required
            className={
              isOverStock || (isZeroStock && !item?.allowNegativeStock)
                ? "!border-rose-500 !bg-rose-50/30 !focus:border-rose-500 !focus:ring-rose-500/20 dark:!bg-rose-950/10"
                : ""
            }
          />

          {/* Validation automatique en direct sous le champ Quantité */}
          {enteredQty <= 0 && line.qty.trim() !== "" ? (
            <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
              La quantité doit être supérieure à 0.
            </p>
          ) : isZeroStock && !item?.allowNegativeStock ? (
            <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
              Transfert impossible : 0 unité disponible dans l&apos;entrepôt source.
            </p>
          ) : isOverStock ? (
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-xs text-rose-600 dark:text-rose-400">
              <span className="font-medium">
                Quantité insuffisante : demandé {enteredQty}, mais seulement {remainingForThisLine} {item?.storageUnit || "unité(s)"} disponible(s).
              </span>
              <button
                type="button"
                onClick={() => onChange({ qty: String(remainingForThisLine) })}
                className="font-semibold underline hover:text-rose-800"
              >
                Ajuster à {remainingForThisLine}
              </button>
            </div>
          ) : item?.allowNegativeStock && enteredQty > availableForLine ? (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Stock négatif : le stock passera de {availableForLine} à {availableForLine - enteredQty}.
            </p>
          ) : null}
        </div>

        {item?.trackLots ? (
          <div>
            <Label>Lot source (obligatoire)</Label>
            <select
              value={line.lotId}
              onChange={(e) => onChange({ lotId: e.target.value })}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">— Choisir un lot —</option>
              {(lotsQuery.data?.levels ?? [])
                .filter((l) => l.lotId)
                .map((l) => (
                  <option key={l.levelId} value={l.lotId!}>
                    Lot {l.lotNumber} — dispo {l.qtyAvailable} {item?.storageUnit || "unités"}
                    {l.locationCode ? ` @ ${l.locationCode}` : ""}
                  </option>
                ))}
            </select>
          </div>
        ) : null}

        <div>
          <Label>Emplacement source</Label>
          <select
            value={line.sourceLocationId}
            onChange={(e) => onChange({ sourceLocationId: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">— Automatique / Optionnel —</option>
            {uniqueSourceLocs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Emplacement destination</Label>
          <select
            value={line.destLocationId}
            onChange={(e) => onChange({ destLocationId: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">— Automatique / Optionnel —</option>
            {(destWarehouse?.locations ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </select>
        </div>

        {item?.trackSerials ? (
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Numéros de série à transférer</Label>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  parsedSerials.length === targetQty
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : parsedSerials.length > targetQty
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
              >
                {parsedSerials.length} / {targetQty} numéro{targetQty > 1 ? "s" : ""} sélectionné{parsedSerials.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Chips cliquables des numéros en stock dans l'entrepôt source */}
            {availableList.length > 0 ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1.5 text-xs text-gray-500">
                  Cliquer pour sélectionner parmi les numéros disponibles dans l&apos;entrepôt source :
                </p>
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                  {availableList.map((s) => {
                    const isSelected = parsedSerials.includes(s.serialNumber.toUpperCase());
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSerial(s.serialNumber)}
                        className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-gray-300 bg-white text-gray-700 hover:border-primary/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        {s.serialNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : sourceWarehouseId && line.stockItemId ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Aucun numéro de série disponible en stock dans cet entrepôt source.
              </p>
            ) : null}

            <textarea
              value={line.serialNumbers}
              onChange={(e) => onChange({ serialNumbers: e.target.value })}
              rows={2}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="Numéros de série (un par ligne ou séparés par virgule)"
            />

            {duplicateSerials.length > 0 ? (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Attention : le numéro de série « {duplicateSerials[0]} » est saisi plusieurs fois.
              </p>
            ) : null}

            {unavailableSerials.length > 0 ? (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Avertissement : le numéro « {unavailableSerials[0]} » ne figure pas dans la liste des séries en stock de cet entrepôt.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CreateStockTransferPage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const articlesQuery = useStockArticles();
  const { warehousesQuery } = useWarehouses(false);
  const { createTransferMutation } = useStockTransfers();

  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destWarehouseId, setDestWarehouseId] = useState("");
  const [plannedDate, setPlannedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [lineErrors, setLineErrors] = useState<Record<string, string | null>>({});

  const configuredArticles = useMemo(
    () =>
      (articlesQuery.data ?? []).filter(
        (a) => a.configured && a.stockItem && !a.isArchived,
      ),
    [articlesQuery.data],
  );

  const warehouses = warehousesQuery.data ?? [];
  const destWarehouse = warehouses.find((w) => w.id === destWarehouseId);

  // Pré-sélection de l'entrepôt par défaut pour la source
  useEffect(() => {
    if (!sourceWarehouseId && warehouses.length > 0) {
      const def = warehouses.find((w) => w.isDefault) ?? warehouses[0];
      if (def) {
        setSourceWarehouseId(def.id);
        const other = warehouses.find((w) => w.id !== def.id);
        if (other && !destWarehouseId) {
          setDestWarehouseId(other.id);
        }
      }
    }
  }, [warehouses, sourceWarehouseId, destWarehouseId]);

  const handleValidationChange = useCallback(
    (key: string, error: string | null) => {
      setLineErrors((prev) => {
        if (prev[key] === error) return prev;
        return { ...prev, [key]: error };
      });
    },
    [],
  );

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
    setLineErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const hasBlockingLineErrors = Object.values(lineErrors).some(Boolean);
  const isSameWarehouse = Boolean(
    sourceWarehouseId &&
      destWarehouseId &&
      sourceWarehouseId === destWarehouseId,
  );
  const isFormInvalid =
    hasBlockingLineErrors ||
    isSameWarehouse ||
    !sourceWarehouseId ||
    !destWarehouseId;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isFormInvalid) {
      return;
    }
    const payload: CreateStockTransferPayload = {
      sourceWarehouseId,
      destWarehouseId,
      plannedDate: plannedDate || undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((line) => ({
        stockItemId: line.stockItemId,
        qty: Number(line.qty),
        lotId: line.lotId || undefined,
        sourceLocationId: line.sourceLocationId || undefined,
        destLocationId: line.destLocationId || undefined,
        serialNumbers: line.serialNumbers
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    };

    await runAction({
      loadingMessage: "Création du transfert...",
      success: { title: "Transfert créé" },
      error: { title: "Création impossible" },
      action: async () => {
        const transfer = await createTransferMutation.mutateAsync(payload);
        router.push(`/stock/transferts/${transfer.id}`);
        return transfer;
      },
    });
  };

  if (articlesQuery.isLoading || warehousesQuery.isLoading) {
    return (
      <RequireStockAccess requireManage>
        <LoadingBlock label="Chargement..." />
      </RequireStockAccess>
    );
  }

  const isLoading = articlesQuery.isLoading || warehousesQuery.isLoading;

  return (
    <RequireStockAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/stock/transferts"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Retour aux transferts
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau transfert
          </h1>
          <p className="text-sm text-gray-500">
            Source → destination, avec vérification temps réel des stocks et numéros de série (UC-S05).
          </p>
        </div>

        {(articlesQuery.isError || warehousesQuery.isError) && (
          <ErrorState
            title="Données indisponibles"
            message="Impossible de charger articles ou entrepôts."
            onRetry={() => {
              articlesQuery.refetch();
              warehousesQuery.refetch();
            }}
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
            <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 dark:border-gray-800 dark:bg-gray-900/40">
              <div>
                <Label>Entrepôt source (départ)</Label>
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => {
                    const newSource = e.target.value;
                    setSourceWarehouseId(newSource);
                    if (destWarehouseId === newSource) {
                      const other = warehouses.find((w) => w.id !== newSource);
                      setDestWarehouseId(other ? other.id : "");
                    }
                  }}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir l&apos;entrepôt source —</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                      {w.isDefault ? " (défaut)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Entrepôt destination (arrivée)</Label>
                <select
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir l&apos;entrepôt destination —</option>
                  {warehouses
                    .filter((w) => w.id !== sourceWarehouseId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                </select>
              </div>

              {isSameWarehouse ? (
                <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  L&apos;entrepôt source et l&apos;entrepôt destination doivent être distincts.
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

              <div className="md:col-span-2">
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Motif du transfert, références de transport…"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Lignes de transfert ({lines.length})
                  </h2>
                  <p className="text-xs text-gray-400">
                    Vérification en temps réel des disponibilités dans l&apos;entrepôt source
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, emptyLine()])}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  + Ajouter une ligne
                </button>
              </div>

              {lines.map((line, index) => (
                <TransferLineFields
                  key={line.key}
                  line={line}
                  allLines={lines}
                  index={index}
                  sourceWarehouseId={sourceWarehouseId}
                  destWarehouse={destWarehouse}
                  configuredArticles={configuredArticles}
                  onChange={(patch) => updateLine(line.key, patch)}
                  onRemove={() => removeLine(line.key)}
                  canRemove={lines.length > 1}
                  onValidationChange={handleValidationChange}
                />
              ))}
            </section>

            {/* Alerte bloquante avant enregistrement si des erreurs subsistent */}
            {hasBlockingLineErrors ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Des erreurs empêchent la création du transfert :
                </h4>
                <ul className="mt-1 list-disc pl-5 text-xs text-rose-700 dark:text-rose-400">
                  {Object.entries(lineErrors)
                    .filter(([, err]) => Boolean(err))
                    .map(([key, err]) => {
                      const idx = lines.findIndex((l) => l.key === key);
                      return (
                        <li key={key}>
                          Ligne {idx + 1} : {err}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/stock/transferts"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </Link>
              <Button disabled={isBusy || isFormInvalid}>
                {isBusy ? "Création en cours..." : "Créer le transfert"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
