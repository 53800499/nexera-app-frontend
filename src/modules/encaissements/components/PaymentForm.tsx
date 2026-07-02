"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver, type SubmitErrorHandler } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useClients } from "@/modules/crm/hooks/useClients";
import type { ClientSummary } from "@/modules/crm/types/client.types";
import { useActionFeedback } from "@/shared/components/feedback";
import { CurrencySelect } from "@/shared/components/form/CurrencySelect";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import {
  focusFirstFormError,
  scrollToFormField,
} from "@/shared/forms/formErrorFocus";
import { useClientPaymentContext } from "../hooks/usePayments";
import type { CreatePaymentPayload } from "../types/payment.types";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "../schemas/paymentForm.schema";
import {
  formatPaymentMoney,
  PAYMENT_METHOD_LABELS,
} from "../utils/paymentLabels";

type Props = {
  isSubmitting: boolean;
  submitLabel: string;
  defaultClientId?: string;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700">
      {children}
    </h3>
  );
}

function ClientSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (clientId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { clientsQuery } = useClients({ q: query || undefined, limit: 10 });
  const clients = clientsQuery.data?.items ?? [];

  useEffect(() => {
    if (!value || query) return;
    const selected = clients.find((client) => client.id === value);
    if (selected) {
      setSearch(`${selected.code} — ${selected.companyName}`);
    }
  }, [value, clients, query]);

  return (
    <div className="relative">
      <Label>
        Client <span className="text-red-600">*</span>
      </Label>
      <Input
        value={search}
        placeholder="Rechercher un client..."
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setSearch(event.target.value);
          setQuery(event.target.value.trim());
          setOpen(true);
        }}
      />
      {open && clients.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {clients.map((client: ClientSummary) => (
            <li key={client.id}>
              <button
                type="button"
                className="w-full rounded px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                onMouseDown={() => {
                  onChange(client.id);
                  setSearch(`${client.code} — ${client.companyName}`);
                  setOpen(false);
                }}
              >
                <div className="font-medium">{client.companyName}</div>
                <div className="text-xs text-gray-500">{client.code}</div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PaymentForm({
  isSubmitting,
  submitLabel,
  defaultClientId,
  onSubmit,
}: Props) {
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      clientId: defaultClientId ?? "",
      amount: 0,
      paymentMethod: "wire",
      allocationMode: "fifo",
      currency: DEFAULT_CURRENCY,
      exchangeRate: 1,
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: "",
      notes: "",
      imputations: [],
    },
  });

  const clientId = watch("clientId");
  const allocationMode = watch("allocationMode");
  const amount = watch("amount");
  const currency = watch("currency");
  const imputations = watch("imputations");

  const contextQuery = useClientPaymentContext(clientId);
  const context = contextQuery.data;
  const openInvoices = context?.openInvoices ?? [];
  const syncedClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!context || !clientId) return;
    if (syncedClientIdRef.current === clientId) return;
    syncedClientIdRef.current = clientId;
    setValue("currency", context.defaultCurrency || DEFAULT_CURRENCY);
  }, [clientId, context, setValue]);

  const manualTotal = useMemo(
    () => (imputations ?? []).reduce((sum, row) => sum + (row.amount || 0), 0),
    [imputations],
  );

  const setManualAmount = (invoiceId: string, value: number) => {
    const current = imputations ?? [];
    const existing = current.find((row) => row.invoiceId === invoiceId);
    if (value <= 0) {
      setValue(
        "imputations",
        current.filter((row) => row.invoiceId !== invoiceId),
      );
      return;
    }
    if (existing) {
      setValue(
        "imputations",
        current.map((row) =>
          row.invoiceId === invoiceId ? { ...row, amount: value } : row,
        ),
      );
      return;
    }
    setValue("imputations", [...current, { invoiceId, amount: value }]);
  };

  const handleFormSubmit = async (values: PaymentFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const { message, firstField } = applyFormApiErrors(error, setError);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      void showResult({
        variant: "error",
        title: "Enregistrement impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById("payment-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<PaymentFormValues> = (
    fieldErrors,
  ) => {
    const firstError = focusFirstFormError(fieldErrors);
    if (!firstError) return;
    setFormError(firstError.message);
    void showResult({
      variant: "error",
      title: "Formulaire incomplet",
      message: `${firstError.message} Corrigez le champ indiqué puis réessayez.`,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
      className="space-y-8"
      noValidate
    >
      {formError ? (
        <p
          id="payment-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <section className="space-y-4">
        <SectionTitle>Client</SectionTitle>
        <div data-form-field="clientId">
          <ClientSearchField
            value={clientId}
            onChange={(id) => setValue("clientId", id, { shouldValidate: true })}
          />
          {errors.clientId ? (
            <p className="mt-1 text-xs text-red-600">{errors.clientId.message}</p>
          ) : null}
        </div>
        {contextQuery.isFetching && clientId ? (
          <p className="text-sm text-gray-500">Chargement des factures ouvertes...</p>
        ) : null}
        {context ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/50">
            <p className="font-medium">{context.clientName}</p>
            <p className="mt-1 text-gray-500">
              Total ouvert : {formatPaymentMoney(context.totalOpenDue, context.defaultCurrency)}
            </p>
            {context.availableAdvances.length > 0 ? (
              <p className="mt-1 text-gray-500">
                Avances disponibles :{" "}
                {context.availableAdvances
                  .map((advance) =>
                    formatPaymentMoney(advance.remainingAmount, advance.currency),
                  )
                  .join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {openInvoices.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle>Factures ouvertes</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left">N°</th>
                  <th className="px-3 py-2 text-left">Échéance</th>
                  <th className="px-3 py-2 text-right">Reste dû</th>
                  {allocationMode === "manual" ? (
                    <th className="px-3 py-2 text-right">Imputer</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {openInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2">
                      <Link
                        href={`/factures/${invoice.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatPaymentMoney(invoice.amountDue, invoice.currency)}
                    </td>
                    {allocationMode === "manual" ? (
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          max={invoice.amountDue}
                          step="0.01"
                          className="ml-auto max-w-[120px]"
                          value={
                            imputations?.find((row) => row.invoiceId === invoice.id)
                              ?.amount ?? ""
                          }
                          onChange={(event) =>
                            setManualAmount(
                              invoice.id,
                              event.target.value ? Number(event.target.value) : 0,
                            )
                          }
                        />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : clientId && contextQuery.isSuccess ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Aucune facture ouverte pour ce client. Le montant sera enregistré en avance.
        </p>
      ) : null}

      <section className="space-y-4">
        <SectionTitle>Encaissement</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div data-form-field="amount">
            <Label>
              Montant reçu <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount ? (
              <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
            ) : null}
          </div>
          <div>
            <Label>Mode de paiement</Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("paymentMethod")}
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Devise</Label>
            <CurrencySelect {...register("currency")} />
          </div>
          <div>
            <Label>Taux de change</Label>
            <Input
              type="number"
              min={0.0001}
              step="0.0001"
              {...register("exchangeRate", { valueAsNumber: true })}
            />
          </div>
          <div data-form-field="paymentDate">
            <Label>Date de réception</Label>
            <Input type="date" {...register("paymentDate")} />
          </div>
          <div>
            <Label>Référence</Label>
            <Input
              placeholder="N° chèque, réf. virement..."
              {...register("reference")}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Input {...register("notes")} />
          </div>
          <div className="md:col-span-2" data-form-field="allocationMode">
            <Label>Mode d&apos;imputation</Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("allocationMode")}
            >
              <option value="fifo">Automatique (FIFO — plus ancienne en premier)</option>
              <option value="manual">Manuelle</option>
            </select>
          </div>
        </div>
        {allocationMode === "manual" ? (
          <div className="text-sm text-gray-500">
            Total imputé : {formatPaymentMoney(manualTotal, currency)} /{" "}
            {formatPaymentMoney(amount || 0, currency)}
            {errors.imputations?.message ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.imputations.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}

export function buildCreatePaymentPayload(
  values: PaymentFormValues,
): CreatePaymentPayload {
  return {
    clientId: values.clientId,
    amount: values.amount,
    paymentMethod: values.paymentMethod,
    allocationMode: values.allocationMode,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    ...(values.paymentDate ? { paymentDate: values.paymentDate } : {}),
    ...(values.reference?.trim() ? { reference: values.reference.trim() } : {}),
    ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    ...(values.allocationMode === "manual"
      ? { imputations: values.imputations }
      : {}),
  };
}
