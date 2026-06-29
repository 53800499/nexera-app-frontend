"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { PaymentMethod } from "../types/invoice.types";

type Props = {
  amountDue: number;
  currency: string;
  isSubmitting: boolean;
  onSubmit: (values: {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: string;
    reference: string;
    notes: string;
  }) => Promise<void>;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "wire", label: "Virement" },
  { value: "check", label: "Chèque" },
  { value: "cash", label: "Espèces" },
  { value: "card", label: "Carte bancaire" },
  { value: "other", label: "Autre" },
];

export function InvoicePaymentForm({
  amountDue,
  currency,
  isSubmitting,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(amountDue);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wire");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      amount,
      paymentMethod,
      paymentDate,
      reference,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>
          Montant ({currency}) <span className="text-red-600">*</span>
        </Label>
        <Input
          type="number"
          min={0.01}
          max={amountDue}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <p className="mt-1 text-xs text-gray-500">
          Reste dû : {amountDue.toFixed(2)} {currency}
        </p>
      </div>
      <div>
        <Label>Mode de paiement</Label>
        <select
          value={paymentMethod}
          onChange={(event) =>
            setPaymentMethod(event.target.value as PaymentMethod)
          }
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {PAYMENT_METHODS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Date de réception</Label>
        <Input
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
        />
      </div>
      <div>
        <Label>Référence transaction</Label>
        <Input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="N° chèque, réf. virement..."
        />
      </div>
      <div>
        <Label>Notes</Label>
        <Input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer le paiement"}
      </button>
    </form>
  );
}
