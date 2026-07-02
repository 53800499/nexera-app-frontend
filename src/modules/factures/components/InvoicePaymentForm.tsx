"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useActionFeedback } from "@/shared/components/feedback";
import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { scrollToFormField } from "@/shared/forms/formErrorFocus";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
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
  const { showResult } = useActionFeedback();
  const [amount, setAmount] = useState(amountDue);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wire");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const applyPaymentApiErrors = (error: unknown) => {
    if (!(error instanceof ApiValidationError)) {
      return {
        message: resolveFormErrorMessage(error),
        firstField: null as string | null,
      };
    }

    const nextFieldErrors: Record<string, string> = {};
    let firstField: string | null = null;

    for (const [field, message] of Object.entries(error.fieldErrors)) {
      if (field === "root") continue;
      nextFieldErrors[field] = message;
      if (!firstField) firstField = field;
    }

    setFieldErrors(nextFieldErrors);
    return {
      message: error.fieldErrors.root ?? error.message,
      firstField,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!amount || amount <= 0) {
      const message = "Le montant doit être supérieur à zéro.";
      setFormError(message);
      setFieldErrors({ amount: message });
      void showResult({
        variant: "error",
        title: "Paiement invalide",
        message,
      });
      scrollToFormField("amount");
      return;
    }

    if (amount > amountDue) {
      const message = `Le montant ne peut pas dépasser le reste dû (${amountDue.toFixed(2)} ${currency}).`;
      setFormError(message);
      setFieldErrors({ amount: message });
      void showResult({
        variant: "error",
        title: "Paiement invalide",
        message,
      });
      scrollToFormField("amount");
      return;
    }

    try {
      await onSubmit({
        amount,
        paymentMethod,
        paymentDate,
        reference,
        notes,
      });
    } catch (error) {
      const { message, firstField } = applyPaymentApiErrors(error);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      void showResult({
        variant: "error",
        title: "Paiement impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById("invoice-payment-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p
          id="invoice-payment-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div data-form-field="amount">
        <Label>
          Montant ({currency}) <span className="text-red-600">*</span>
        </Label>
        <Input
          type="number"
          min={0.01}
          max={amountDue}
          step="0.01"
          value={amount}
          error={Boolean(fieldErrors.amount)}
          onChange={(event) => {
            clearFieldError("amount");
            setAmount(Number(event.target.value));
          }}
        />
        {fieldErrors.amount ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Reste dû : {amountDue.toFixed(2)} {currency}
          </p>
        )}
      </div>
      <div data-form-field="paymentMethod">
        <Label>Mode de paiement</Label>
        <select
          value={paymentMethod}
          onChange={(event) => {
            clearFieldError("paymentMethod");
            setPaymentMethod(event.target.value as PaymentMethod);
          }}
          className={`h-11 w-full rounded-lg border px-3 text-sm dark:bg-gray-900 ${
            fieldErrors.paymentMethod
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          {PAYMENT_METHODS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.paymentMethod ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.paymentMethod}</p>
        ) : null}
      </div>
      <div data-form-field="paymentDate">
        <Label>Date de réception</Label>
        <Input
          type="date"
          value={paymentDate}
          error={Boolean(fieldErrors.paymentDate)}
          onChange={(event) => {
            clearFieldError("paymentDate");
            setPaymentDate(event.target.value);
          }}
        />
        {fieldErrors.paymentDate ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.paymentDate}</p>
        ) : null}
      </div>
      <div data-form-field="reference">
        <Label>Référence transaction</Label>
        <Input
          value={reference}
          error={Boolean(fieldErrors.reference)}
          onChange={(event) => {
            clearFieldError("reference");
            setReference(event.target.value);
          }}
          placeholder="N° chèque, réf. virement..."
        />
        {fieldErrors.reference ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.reference}</p>
        ) : null}
      </div>
      <div data-form-field="notes">
        <Label>Notes</Label>
        <Input
          value={notes}
          error={Boolean(fieldErrors.notes)}
          onChange={(event) => {
            clearFieldError("notes");
            setNotes(event.target.value);
          }}
        />
        {fieldErrors.notes ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.notes}</p>
        ) : null}
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
