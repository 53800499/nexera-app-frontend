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
  useAvailableLots,
  useStockArticles,
  useStockExits,
  useWarehouses,
} from "../hooks/useStock";
import type {
  CreateStockExitPayload,
  StockArticleRow,
  StockExitType,
} from "../types/stock.types";
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
  onChange,
  onRemove,
  canRemove,
  index,
}: {
  line: LineDraft;
  warehouseId: string;
  configuredArticles: StockArticleRow[];
  onChange: (patch: Partial<LineDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}) {
  const item = configuredArticles.find(
    (a) => a.stockItem?.id === line.stockItemId,
  )?.stockItem;
  const lotsQuery = useAvailableLots(line.stockItemId, warehouseId);
  const isFifo = item?.valuationMethod === "fifo" && item?.trackLots;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Ligne {index + 1}</span>
        {canRemove ? (
          <button type="button" className="text-xs text-red-600" onClick={onRemove}>
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
              onChange({ stockItemId: e.target.value, lotId: "" })
            }
            required
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">— Choisir —</option>
            {(configuredArticles ?? []).map((a) => (
              <option key={a.stockItem!.id} value={a.stockItem!.id}>
                {a.reference} — {a.name} (dispo miroir: {a.stockQuantity})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Quantité</Label>
          <Input
            type="number"
            min="0.0001"
            step="any"
            value={line.qty}
            onChange={(e) => onChange({ qty: e.target.value })}
            required
          />
        </div>
        {item?.trackLots ? (
          <div>
            <Label>
              Lot {isFifo ? "(FIFO auto si vide)" : "(obligatoire)"}
            </Label>
            <select
              value={line.lotId}
              onChange={(e) => onChange({ lotId: e.target.value })}
              required={!isFifo}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">
                {isFifo ? "— FIFO automatique —" : "— Choisir —"}
              </option>
              {(lotsQuery.data?.levels ?? [])
                .filter((l) => l.lotId)
                .map((l) => (
                  <option key={l.levelId} value={l.lotId!}>
                    {l.lotNumber} — dispo {l.qtyAvailable}
                    {l.locationCode ? ` @ ${l.locationCode}` : ""}
                  </option>
                ))}
            </select>
            {isFifo && !line.lotId ? (
              <p className="mt-1 text-xs text-gray-500">
                Le lot le plus ancien sera sélectionné (RM-OUT02).
              </p>
            ) : null}
          </div>
        ) : null}
        {item?.trackSerials ? (
          <div className="md:col-span-2">
            <Label>N° de série sortis (RM-OUT05)</Label>
            <textarea
              value={line.serialNumbers}
              onChange={(e) => onChange({ serialNumbers: e.target.value })}
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Retour aux mouvements
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvelle sortie
          </h1>
          <p className="text-sm text-gray-500">
            Consommation, perte, retour fournisseur ou ajustement (UC-S04).
          </p>
        </div>

        {isLoading && <LoadingBlock label="Chargement..." />}
        {(articlesQuery.isError || warehousesQuery.isError) && (
          <ErrorState
            title="Données indisponibles"
            message="Impossible de charger articles ou entrepôts."
          />
        )}

        {!isLoading && configuredArticles.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 dark:border-gray-800">
              <div>
                <Label>Type de sortie</Label>
                <select
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(e.target.value as StockExitType)
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
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
                  Les sorties vente (OUT_SALE) sont créées automatiquement à
                  l&apos;émission d&apos;une facture.
                </p>
              </div>
              <div>
                <Label>Entrepôt source</Label>
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
                    placeholder="FG-ENTRETIEN"
                  />
                </div>
              ) : null}
              {needsReason ? (
                <div className="md:col-span-2">
                  <Label>Motif (obligatoire)</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Casse / écart inventaire…"
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
              {lines.map((line, index) => (
                <ExitLineFields
                  key={line.key}
                  line={line}
                  index={index}
                  warehouseId={warehouseId}
                  configuredArticles={configuredArticles}
                  canRemove={lines.length > 1}
                  onChange={(patch) => updateLine(line.key, patch)}
                  onRemove={() =>
                    setLines((prev) => prev.filter((l) => l.key !== line.key))
                  }
                />
              ))}
            </section>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={validateNow}
                onChange={(e) => setValidateNow(e.target.checked)}
              />
              Valider immédiatement (si perte &gt; seuil : brouillon forcé)
            </label>

            <div className="flex justify-end">
              <Button disabled={isBusy || !warehouseId}>
                {isBusy ? "Enregistrement..." : "Enregistrer la sortie"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
