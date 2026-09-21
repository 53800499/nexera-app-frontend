"use client";

import { useEffect, useMemo, useState } from "react";
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
  useStockExits,
  useWarehouses,
} from "../../hooks/useStock";
import type {
  CreateStockExitPayload,
  StockArticleRow,
  StockExitType,
} from "../../types/stock.types";
import { STOCK_EXIT_TYPE_LABELS } from "../utils/movementLabels";

type LineDraft = {
  key: string;
  stockItemId: string;
  qty: string;
  lotId: string;
  locationId: string;
  serialNumbers: string;
};

function emptyLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    stockItemId: "",
    qty: "1",
    lotId: "",
    locationId: "",
    serialNumbers: "",
  };
}

function ExitLineFields({
  line,
  warehouseId,
  configuredArticles,
  allLines,
  onChange,
  onRemove,
  onValidationChange,
  canRemove,
  index,
}: {
  line: LineDraft;
  warehouseId: string;
  configuredArticles: StockArticleRow[];
  allLines: LineDraft[];
  onChange: (patch: Partial<LineDraft>) => void;
  onRemove: () => void;
  onValidationChange: (key: string, error: string | null) => void;
  canRemove: boolean;
  index: number;
}) {
  const article = configuredArticles.find(
    (a) => a.stockItem?.id === line.stockItemId,
  );
  const item = article?.stockItem;
  const lotsQuery = useAvailableLots(line.stockItemId, warehouseId);
  const serialsQuery = useAvailableSerials(line.stockItemId, warehouseId);
  const isFifo = item?.valuationMethod === "fifo" && item?.trackLots;

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

  const remainingForThisLine = Math.max(0, availableForLine - otherLinesRequested);

  const parsedSerials = line.serialNumbers
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const availableList = serialsQuery.data?.serials ?? [];
  const targetQty = Math.round(Number(line.qty) || 0);
  const enteredQty = Number(line.qty) || 0;

  const isZeroStock =
    Boolean(line.stockItemId && warehouseId) &&
    !lotsQuery.isLoading &&
    availableForLine <= 0;

  const isOverStock =
    Boolean(line.stockItemId && warehouseId) &&
    !lotsQuery.isLoading &&
    !item?.allowNegativeStock &&
    enteredQty > remainingForThisLine;

  const duplicateSerials = parsedSerials.filter(
    (sn, idx, arr) => arr.indexOf(sn) !== idx,
  );

  const unavailableSerials =
    availableList.length > 0
      ? parsedSerials.filter(
          (sn) => !availableList.some((s) => s.serialNumber.toUpperCase() === sn),
        )
      : [];

  // Emplacements disponibles dans les niveaux
  const availableLocations = useMemo(() => {
    const locMap = new Map<string, string>();
    levels.forEach((l) => {
      if (l.locationId && l.locationCode) {
        locMap.set(l.locationId, l.locationCode);
      }
    });
    return Array.from(locMap.entries()).map(([id, code]) => ({ id, code }));
  }, [levels]);

  // Validation en temps réel envoyée au parent
  useEffect(() => {
    let error: string | null = null;
    if (!line.stockItemId) {
      error = "Veuillez choisir un article";
    } else if (enteredQty <= 0) {
      error = "La quantité doit être supérieure à 0";
    } else if (isZeroStock && !item?.allowNegativeStock) {
      error = "Stock épuisé dans cet entrepôt";
    } else if (isOverStock && !item?.allowNegativeStock) {
      error = "Quantité supérieure au stock disponible";
    } else if (item?.trackLots && !isFifo && !line.lotId) {
      error = "Veuillez choisir un lot";
    } else if (item?.trackSerials && parsedSerials.length !== targetQty) {
      error = "Numéros de série non conformes à la quantité";
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
    isFifo,
    line.lotId,
    parsedSerials.length,
    targetQty,
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
          <Label>Article</Label>
          <select
            value={line.stockItemId}
            onChange={(e) =>
              onChange({
                stockItemId: e.target.value,
                lotId: "",
                locationId: "",
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

          {/* Indicateur de stock en temps réel */}
          {line.stockItemId ? (
            !warehouseId ? (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Sélectionnez un entrepôt source ci-dessus pour vérifier la disponibilité en stock.
              </p>
            ) : lotsQuery.isLoading ? (
              <p className="mt-1.5 animate-pulse text-xs text-gray-500">
                Vérification du stock disponible dans cet entrepôt...
              </p>
            ) : availableForLine > 0 ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>
                    Stock disponible dans cet entrepôt :{" "}
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
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <div className="flex items-center gap-2 font-semibold text-rose-900 dark:text-rose-200">
                  <span>🚫 Aucun stock disponible dans cet entrepôt (0 {item?.storageUnit || "unité"}).</span>
                </div>
                {article && (article.stockQuantity ?? 0) > 0 ? (
                  <p className="mt-1 text-rose-700/90 dark:text-rose-400">
                    Le catalogue affiche {article.stockQuantity} unité(s) au global, mais ce stock est soit dans un autre entrepôt, soit non validé (brouillon).
                  </p>
                ) : null}
                {item?.allowNegativeStock ? (
                  <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                    ℹ️ Le stock négatif est autorisé pour cet article : la sortie reste possible.
                  </p>
                ) : null}
              </div>
            )
          ) : null}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label>Quantité</Label>
            {line.stockItemId && warehouseId && availableForLine > 0 ? (
              <button
                type="button"
                onClick={() => onChange({ qty: String(remainingForThisLine) })}
                className="text-xs font-medium text-primary hover:underline"
              >
                Max ({remainingForThisLine})
              </button>
            ) : null}
          </div>
          <Input
            type="number"
            min="0.0001"
            max={!item?.allowNegativeStock && availableForLine > 0 ? remainingForThisLine : undefined}
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
              Sortie impossible : 0 unité disponible dans cet entrepôt.
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
            <Label>
              Lot {isFifo ? "(sélection automatique FIFO si non renseigné)" : "(obligatoire)"}
            </Label>
            <select
              value={line.lotId}
              onChange={(e) => onChange({ lotId: e.target.value })}
              required={!isFifo}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">
                {isFifo ? "— FIFO automatique (plus ancien d'abord) —" : "— Choisir un lot —"}
              </option>
              {(lotsQuery.data?.levels ?? [])
                .filter((l) => l.lotId)
                .map((l) => (
                  <option key={l.levelId} value={l.lotId!}>
                    Lot {l.lotNumber} — dispo {l.qtyAvailable} {item?.storageUnit || "unités"}
                    {l.locationCode ? ` @ ${l.locationCode}` : ""}
                  </option>
                ))}
            </select>
            {isFifo && !line.lotId ? (
              <p className="mt-1 text-xs text-gray-500">
                Le lot le plus ancien sera automatiquement déstocké en priorité.
              </p>
            ) : null}
          </div>
        ) : availableLocations.length > 1 ? (
          <div>
            <Label>Emplacement (optionnel)</Label>
            <select
              value={line.locationId}
              onChange={(e) => onChange({ locationId: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">— Automatique / Tous —</option>
              {availableLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.code}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {item?.trackSerials ? (
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Numéros de série à sortir</Label>
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

            {availableList.length > 0 ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="mb-1.5 text-xs text-gray-500">
                  Cliquer pour sélectionner parmi les numéros disponibles en stock :
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
                        {s.locationCode ? ` (${s.locationCode})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : line.stockItemId && warehouseId ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Aucun numéro de série actuellement disponible en stock pour cet article dans cet entrepôt.
              </p>
            ) : null}

            <textarea
              value={line.serialNumbers}
              onChange={(e) => onChange({ serialNumbers: e.target.value })}
              rows={3}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder={"Saisir ou scanner les numéros de série (un par ligne ou séparés par virgule)"}
            />

            {duplicateSerials.length > 0 ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                Attention : le numéro « {duplicateSerials[0]} » est saisi plusieurs fois.
              </p>
            ) : null}

            {unavailableSerials.length > 0 && availableList.length > 0 ? (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Attention : le numéro « {unavailableSerials[0]} » n&apos;est pas détecté parmi les stocks disponibles de cet entrepôt.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CreateStockExitPage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const articlesQuery = useStockArticles();
  const { warehousesQuery } = useWarehouses(false);
  const { createExitMutation } = useStockExits();

  const [movementType, setMovementType] =
    useState<StockExitType>("OUT_CONSUMPTION");
  const [warehouseId, setWarehouseId] = useState("");
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validateNow, setValidateNow] = useState(true);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [lineErrors, setLineErrors] = useState<Record<string, string | null>>({});

  // Présélection automatique de l'entrepôt par défaut
  useEffect(() => {
    if (!warehouseId && warehousesQuery.data?.length) {
      const defaultWh =
        warehousesQuery.data.find((w) => w.isDefault) ?? warehousesQuery.data[0];
      if (defaultWh) {
        setWarehouseId(defaultWh.id);
      }
    }
  }, [warehouseId, warehousesQuery.data]);

  const configuredArticles = useMemo(
    () =>
      (articlesQuery.data ?? []).filter(
        (a) => a.configured && a.stockItem && !a.isArchived,
      ),
    [articlesQuery.data],
  );

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const handleValidationChange = (key: string, error: string | null) => {
    setLineErrors((prev) => {
      if (prev[key] === error) return prev;
      return { ...prev, [key]: error };
    });
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
    setLineErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const activeErrors = useMemo(
    () =>
      Object.entries(lineErrors)
        .filter(([, err]) => Boolean(err))
        .map(([key, err]) => ({ key, err: err! })),
    [lineErrors],
  );

  const hasBlockingError = !warehouseId || activeErrors.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (hasBlockingError) return;

    const payload: CreateStockExitPayload = {
      movementType,
      warehouseId,
      movementDate,
      reference: reference.trim() || undefined,
      costCenter: costCenter.trim() || undefined,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
      validate: validateNow,
      lines: lines.map((line) => {
        const serials = line.serialNumbers
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        return {
          stockItemId: line.stockItemId,
          qty: Number(line.qty),
          lotId: line.lotId || undefined,
          locationId: line.locationId || undefined,
          serialNumbers: serials.length ? serials : undefined,
        };
      }),
    };

    await runAction({
      loadingMessage: "Enregistrement de la sortie...",
      success: { title: "Sortie enregistrée" },
      error: { title: "Enregistrement impossible" },
      action: async () => {
        const movement = await createExitMutation.mutateAsync(payload);
        router.push(`/stock/mouvements/${movement.id}`);
        return movement;
      },
    });
  };

  const isLoading = articlesQuery.isLoading || warehousesQuery.isLoading;
  const needsReason =
    movementType === "OUT_LOSS" || movementType === "OUT_ADJUSTMENT";
  const needsCostCenter = movementType === "OUT_CONSUMPTION";

  return (
    <RequireStockAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/stock/mouvements"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux mouvements
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvelle sortie de stock
          </h1>
          <p className="text-sm text-gray-500">
            Consommation, perte, retour fournisseur ou ajustement avec vérification en temps réel du stock disponible (UC-S04).
          </p>
        </div>

        {isLoading && <LoadingBlock label="Chargement des données..." />}
        {(articlesQuery.isError || warehousesQuery.isError) && (
          <ErrorState
            title="Données indisponibles"
            message="Impossible de charger les articles ou les entrepôts."
          />
        )}

        {!isLoading && configuredArticles.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 dark:border-gray-800 dark:bg-gray-900/40">
              <div>
                <Label>Type de sortie</Label>
                <select
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(e.target.value as StockExitType)
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {Object.entries(STOCK_EXIT_TYPE_LABELS)
                    .filter(([code]) => code !== "OUT_SALE")
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Les sorties vente (OUT_SALE) sont générées automatiquement à l&apos;émission des factures.
                </p>
              </div>
              <div>
                <Label>Entrepôt source</Label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">— Choisir un entrepôt —</option>
                  {(warehousesQuery.data ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name} {w.isDefault ? "(par défaut)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={movementDate}
                  onChange={(e) => setMovementDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Référence</Label>
                <Input
                  value={reference}
                  placeholder="Ex: OS-2026-001"
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              {needsCostCenter ? (
                <div className="md:col-span-2">
                  <Label>Centre de coût</Label>
                  <Input
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    required
                    placeholder="Ex: CHANTIER-NORD, ATELIER-PROD"
                  />
                </div>
              ) : null}
              {needsReason ? (
                <div className="md:col-span-2">
                  <Label>Motif détaillé</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Ex: Casse matériel lors du transport, écart d'inventaire"
                  />
                </div>
              ) : null}
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Remarques éventuelles..."
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Lignes de sortie
                  </h2>
                  <p className="text-xs text-gray-500">
                    Chaque ligne vérifie automatiquement la disponibilité en stock dans l&apos;entrepôt source.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, emptyLine()])}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  + Ajouter une ligne
                </button>
              </div>

              {lines.map((line, index) => (
                <ExitLineFields
                  key={line.key}
                  line={line}
                  index={index}
                  warehouseId={warehouseId}
                  configuredArticles={configuredArticles}
                  allLines={lines}
                  canRemove={lines.length > 1}
                  onChange={(patch) => updateLine(line.key, patch)}
                  onRemove={() => removeLine(line.key)}
                  onValidationChange={handleValidationChange}
                />
              ))}
            </section>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={validateNow}
                  onChange={(e) => setValidateNow(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>
                  Valider immédiatement le mouvement (met à jour le stock en direct ; si perte &gt; 10 000 FCFA : soumis à validation)
                </span>
              </label>
            </div>

            {/* Alerte globale de blocage si des erreurs de validation existent */}
            {hasBlockingError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <p className="font-semibold">Impossible d&apos;enregistrer la sortie :</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {!warehouseId ? (
                    <li>Veuillez sélectionner un entrepôt source.</li>
                  ) : null}
                  {activeErrors.map(({ key, err }) => {
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

            <div className="flex justify-end gap-3">
              <Button
                disabled={isBusy || hasBlockingError}
                className={hasBlockingError ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isBusy ? "Enregistrement..." : "Enregistrer la sortie"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
