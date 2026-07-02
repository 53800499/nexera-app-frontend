"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useActionFeedback } from "@/shared/components/feedback";
import { ApiValidationError } from "@/shared/core/ApiValidationError";
import { scrollToFormField } from "@/shared/forms/formErrorFocus";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
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
  const { showResult } = useActionFeedback();
  const [mode, setMode] = useState<BillingMode>("full");
  const [billingPct, setBillingPct] = useState(100);
  const [amountTtc, setAmountTtc] = useState(remainingTtc);
  const [invoiceType, setInvoiceType] =
    useState<CreateOrderInvoicePayload["invoiceType"]>("standard");
  const [dueDate, setDueDate] = useState("");
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

  const applyInvoiceApiErrors = (error: unknown) => {
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

    const payload: CreateOrderInvoicePayload = {
      invoiceType,
      ...(dueDate ? { dueDate } : {}),
    };

    if (mode === "pct") {
      payload.billingPct = billingPct;
    } else if (mode === "amount") {
      payload.amountTtc = amountTtc;
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      const { message, firstField } = applyInvoiceApiErrors(error);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      void showResult({
        variant: "error",
        title: "Facturation impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById("order-invoice-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p
          id="order-invoice-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div data-form-field="invoiceType">
        <Label>Type de facture</Label>
        <select
          value={invoiceType}
          onChange={(event) => {
            clearFieldError("invoiceType");
            setInvoiceType(
              event.target.value as CreateOrderInvoicePayload["invoiceType"],
            );
          }}
          className={`h-11 w-full rounded-lg border px-3 text-sm dark:bg-gray-900 ${
            fieldErrors.invoiceType
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <option value="standard">Facture standard</option>
          <option value="deposit">Acompte</option>
          <option value="balance">Solde</option>
          <option value="proforma">Proforma</option>
        </select>
        {fieldErrors.invoiceType ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.invoiceType}</p>
        ) : null}
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
        <div data-form-field="billingPct">
          <Label>Pourcentage (%)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            step="0.01"
            value={billingPct}
            error={Boolean(fieldErrors.billingPct)}
            onChange={(event) => {
              clearFieldError("billingPct");
              setBillingPct(Number(event.target.value));
            }}
          />
          {fieldErrors.billingPct ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.billingPct}</p>
          ) : null}
        </div>
      ) : null}

      {mode === "amount" ? (
        <div data-form-field="amountTtc">
          <Label>Montant TTC</Label>
          <Input
            type="number"
            min={0.01}
            max={remainingTtc}
            step="0.01"
            value={amountTtc}
            error={Boolean(fieldErrors.amountTtc)}
            onChange={(event) => {
              clearFieldError("amountTtc");
              setAmountTtc(Number(event.target.value));
            }}
          />
          {fieldErrors.amountTtc ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.amountTtc}</p>
          ) : null}
        </div>
      ) : null}

      <div data-form-field="dueDate">
        <Label>Échéance (optionnel)</Label>
        <Input
          type="date"
          value={dueDate}
          error={Boolean(fieldErrors.dueDate)}
          onChange={(event) => {
            clearFieldError("dueDate");
            setDueDate(event.target.value);
          }}
        />
        {fieldErrors.dueDate ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.dueDate}</p>
        ) : null}
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
