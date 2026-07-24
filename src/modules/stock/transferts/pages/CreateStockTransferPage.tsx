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
import { RequireStockAccess } from "../../components/RequireStockAccess";
import {
  useAvailableLots,
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
  sourceWarehouseId,
  destWarehouse,
  configuredArticles,
  onChange,
  onRemove,
  canRemove,
  index,
}: {
  line: LineDraft;
  sourceWarehouseId: string;
  destWarehouse: Warehouse | undefined;
  configuredArticles: StockArticleRow[];
  onChange: (patch: Partial<LineDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}) {
  const item = configuredArticles.find(
    (a) => a.stockItem?.id === line.stockItemId,
  )?.stockItem;
  const lotsQuery = useAvailableLots(line.stockItemId, sourceWarehouseId);
  const sourceLocations =
    lotsQuery.data?.levels
      ?.filter((l) => l.locationId)
      .map((l) => ({ id: l.locationId!, code: l.locationCode ?? "" })) ?? [];
  const uniqueSourceLocs = Array.from(
    new Map(sourceLocations.map((l) => [l.id, l])).values(),
  );

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
                {a.reference} — {a.name}
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
            <Label>Lot (obligatoire)</Label>
            <select
              value={line.lotId}
              onChange={(e) => onChange({ lotId: e.target.value })}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">— Choisir —</option>
              {(lotsQuery.data?.levels ?? [])
                .filter((l) => l.lotId)
                .map((l) => (
                  <option key={l.levelId} value={l.lotId!}>
                    {l.lotNumber} — dispo {l.qtyAvailable}
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
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">— Optionnel —</option>
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
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">— Optionnel —</option>
            {(destWarehouse?.locations ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
              </option>
            ))}
          </select>
        </div>
        {item?.trackSerials ? (
          <div className="md:col-span-2">
            <Label>N° de série</Label>
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

  const configuredArticles = useMemo(
    () =>
      (articlesQuery.data ?? []).filter(
        (a) => a.configured && a.stockItem && !a.isArchived,
      ),
    [articlesQuery.data],
  );

  const warehouses = warehousesQuery.data ?? [];
  const destWarehouse = warehouses.find((w) => w.id === destWarehouseId);

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sourceWarehouseId === destWarehouseId) {
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
            Source → destination, puis validation émetteur / réception (UC-S05).
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
            <section className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 dark:border-gray-800">
              <div>
                <Label>Entrepôt source</Label>
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir —</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Entrepôt destination</Label>
                <select
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">— Choisir —</option>
                  {warehouses
                    .filter((w) => w.id !== sourceWarehouseId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                </select>
              </div>
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
                <TransferLineFields
                  key={line.key}
                  line={line}
                  index={index}
                  sourceWarehouseId={sourceWarehouseId}
                  destWarehouse={destWarehouse}
                  configuredArticles={configuredArticles}
                  onChange={(patch) => updateLine(line.key, patch)}
                  onRemove={() =>
                    setLines((prev) => prev.filter((l) => l.key !== line.key))
                  }
                  canRemove={lines.length > 1}
                />
              ))}
            </section>

            <div className="flex justify-end">
              <Button
                disabled={
                  isBusy || !sourceWarehouseId || !destWarehouseId
                }
              >
                {isBusy ? "Enregistrement..." : "Créer le transfert"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
