"use client";

import React, { useMemo, useState } from "react";

type ShellProps = {
  title: string;
  description: string;
};

const CLIENTS = [
  { code: "CLT-0001", name: "SOTRABEN", info: "IFU: 32019854" },
  { code: "CLT-0002", name: "NEXA SERVICES", info: "IFU: 00987123" },
  { code: "CLT-0003", name: "YARA SARL", info: "IFU: 44123789" },
];

const ARTICLES = [
  { code: "ART-0001", name: "Audit mensuel", info: "Service - TVA 18%" },
  { code: "ART-0002", name: "Abonnement ERP", info: "SaaS - TVA 18%" },
  { code: "ART-0003", name: "Formation équipe", info: "Service - TVA 0%" },
];

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

function formatAmount(value: string): string {
  const normalized = value.replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function AutoCompleteField({
  label,
  source,
}: {
  label: string;
  source: Array<{ code: string; name: string; info: string }>;
}) {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (value.trim().length < 2) return [];
    const q = value.toLowerCase();
    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q),
    );
  }, [source, value]);

  return (
    <div className="relative">
      <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">{label}</label>
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          setValue(e.target.value);
          setSelectedIndex(0);
        }}
        onKeyDown={(e) => {
          if (!filtered.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const selected = filtered[selectedIndex];
            if (selected) setValue(`${selected.code} - ${selected.name}`);
            setOpen(false);
          }
        }}
        placeholder="Tapez au moins 2 caractères"
        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {filtered.map((item, idx) => (
            <li key={item.code}>
              <button
                type="button"
                onMouseDown={() => {
                  setValue(`${item.code} - ${item.name}`);
                  setOpen(false);
                }}
                className={`w-full rounded px-2 py-2 text-left text-sm ${
                  idx === selectedIndex ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <div className="font-medium">{item.code} - {item.name}</div>
                <div className="text-xs text-gray-500">{item.info}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CommercialPageShell({ title, description }: ShellProps) {
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dateFormat, setDateFormat] = useState<"DD/MM/YYYY" | "MM/DD/YYYY">(
    "DD/MM/YYYY",
  );
  const [amountInput, setAmountInput] = useState("");
  const [lines, setLines] = useState([{ qty: 1, unitPrice: 0 }]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0),
    [lines],
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setOffline((v) => !v)}
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            offline ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {offline ? "Mode hors-ligne actif" : "Passer hors-ligne"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-medium">Comportements UI obligatoires</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {["DRAFT", "SENT", "ACCEPTED", "OVERDUE", "PAID"].map((status) => (
              <span
                key={status}
                className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
              >
                {status}
              </span>
            ))}
          </div>
          <AutoCompleteField label="Sélection client" source={CLIENTS} />
          <div className="mt-3">
            <AutoCompleteField label="Sélection article" source={ARTICLES} />
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="mb-3 font-medium">Saisie document</h2>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Montant</label>
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={() => setAmountInput(formatAmount(amountInput))}
                placeholder="1 000,50"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
            <div>
              <label
                htmlFor="commercial-date"
                className="mb-1 block text-sm text-gray-700 dark:text-gray-300"
              >
                Date
              </label>
              <input
                id="commercial-date"
                type="date"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format affiché: {dateFormat} (stockage ISO 8601)
              </p>
              <button
                type="button"
                className="mt-1 text-xs text-brand-500"
                onClick={() =>
                  setDateFormat((f) => (f === "DD/MM/YYYY" ? "MM/DD/YYYY" : "DD/MM/YYYY"))
                }
              >
                Changer format entreprise
              </button>
            </div>
          </div>

          <div className="mb-3 space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-700">
            {lines.map((line, index) => (
              <div key={`line-${index}`} className="grid grid-cols-3 gap-2">
                <input
                  aria-label={`Quantité ligne ${index + 1}`}
                  type="number"
                  min={1}
                  value={line.qty}
                  onChange={(e) => {
                    const qty = Number(e.target.value || 1);
                    setLines((prev) =>
                      prev.map((l, i) => (i === index ? { ...l, qty } : l)),
                    );
                  }}
                  className="h-10 rounded-lg border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                <input
                  aria-label={`Prix unitaire ligne ${index + 1}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const unitPrice = Number(e.target.value || 0);
                    setLines((prev) =>
                      prev.map((l, i) => (i === index ? { ...l, unitPrice } : l)),
                    );
                  }}
                  className="h-10 rounded-lg border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-lg border border-red-200 px-2 text-sm text-red-600"
                >
                  Supprimer ligne
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { qty: 1, unitPrice: 0 }])}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              Ajouter ligne
            </button>
            <p className="text-sm font-medium">Total recalculé: {formatAmount(String(total))}</p>
          </div>

          <button
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Cette action supprimera la ligne sélectionnée et impactera les totaux du document.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setLines((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
                  setShowDeleteModal(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
