"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { CreateOrderInvoicePayload } from "../types/order.types";

type Props = {
  currency: string;
  remainingTtc: number;
  isSubmitting: boolean;
  onSubmit: (payload: CreateOrderInvoicePayload) => Promise<void>;
};

type BillingMode = "full" | "pct" | "amount";

export function OrderInvoiceForm({
  currency,
  remainingTtc,
  isSubmitting,
  onSubmit,
}: Props) {
  const [mode, setMode] = useState<BillingMode>("full");
  const [billingPct, setBillingPct] = useState(100);
  const [amountTtc, setAmountTtc] = useState(remainingTtc);
  const [invoiceType, setInvoiceType] =
    useState<CreateOrderInvoicePayload["invoiceType"]>("standard");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CreateOrderInvoicePayload = {
      invoiceType,
      ...(dueDate ? { dueDate } : {}),
    };

    if (mode === "pct") {
      payload.billingPct = billingPct;
    } else if (mode === "amount") {
      payload.amountTtc = amountTtc;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type de facture</Label>
        <select
          value={invoiceType}
          onChange={(event) =>
            setInvoiceType(
              event.target.value as CreateOrderInvoicePayload["invoiceType"],
            )
          }
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="standard">Facture standard</option>
          <option value="deposit">Acompte</option>
          <option value="balance">Solde</option>
          <option value="proforma">Proforma</option>
        </select>
      </div>

      <div>
        <Label>Mode de facturation</Label>
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as BillingMode)}
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="full">Facturer le reste ({currency})</option>
          <option value="pct">Pourcentage du reste</option>
          <option value="amount">Montant TTC précis</option>
        </select>
      </div>

      {mode === "pct" ? (
        <div>
          <Label>Pourcentage (%)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            step="0.01"
            value={billingPct}
            onChange={(event) => setBillingPct(Number(event.target.value))}
          />
        </div>
      ) : null}

      {mode === "amount" ? (
        <div>
          <Label>Montant TTC</Label>
          <Input
            type="number"
            min={0.01}
            max={remainingTtc}
            step="0.01"
            value={amountTtc}
            onChange={(event) => setAmountTtc(Number(event.target.value))}
          />
        </div>
      ) : null}

      <div>
        <Label>Échéance (optionnel)</Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting ? "Création..." : "Créer la facture"}
      </button>
    </form>
  );
}
