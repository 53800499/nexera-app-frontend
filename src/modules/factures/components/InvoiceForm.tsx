"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  type Resolver,
  type SubmitErrorHandler,
} from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useCatalogueItems } from "@/modules/catalogue/hooks/useCatalogue";
import type { CatalogItem, TaxRate } from "@/modules/catalogue/types/catalogue.types";
import { useClients } from "@/modules/crm/hooks/useClients";
import type { ClientSummary } from "@/modules/crm/types/client.types";
import { QuotationTotalsPanel } from "@/modules/devis/components/QuotationTotalsPanel";
import { usePaymentTerms } from "@/modules/devis/hooks/usePaymentTerms";
import {
  computeQuotationTotals,
  formatMoney,
} from "@/modules/devis/utils/quotationCalculations";
import { useActionFeedback } from "@/shared/components/feedback";
import { CurrencySelect } from "@/shared/components/form/CurrencySelect";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import {
  focusFirstFormError,
  scrollToFormField,
} from "@/shared/forms/formErrorFocus";
import type {
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "../types/invoice.types";
import {
  defaultInvoiceLine,
  INVOICE_TYPE_OPTIONS,
  invoiceFormSchema,
  type InvoiceFormValues,
} from "../schemas/invoiceForm.schema";

type Props = {
  isSubmitting: boolean;
  submitLabel: string;
  defaultValues?: Partial<InvoiceFormValues>;
  taxRates: TaxRate[];
  lockClient?: boolean;
  lockOrder?: boolean;
  lockQuotation?: boolean;
  orderLabel?: string;
  quotationLabel?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
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
  disabled,
}: {
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
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
        disabled={disabled}
        placeholder="Rechercher un client..."
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setSearch(event.target.value);
          setQuery(event.target.value.trim());
          setOpen(true);
        }}
      />
      {open && !disabled && clients.length > 0 ? (
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

function ItemPicker({ onSelect }: { onSelect: (item: CatalogItem) => void }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { itemsQuery } = useCatalogueItems(query || undefined);
  const items = (itemsQuery.data ?? []).filter((item) => !item.isArchived);

  return (
    <div className="relative min-w-[220px]">
      <Input
        value={search}
        placeholder="Article catalogue..."
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setSearch(event.target.value);
          setQuery(event.target.value.trim());
          setOpen(true);
        }}
      />
      {open && items.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                onMouseDown={() => {
                  onSelect(item);
                  setSearch("");
                  setQuery("");
                  setOpen(false);
                }}
              >
                <div className="font-medium">
                  {item.reference} — {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatMoney(item.priceHt, DEFAULT_CURRENCY)} HT
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function InvoiceForm({
  isSubmitting,
  submitLabel,
  defaultValues,
  taxRates,
  lockClient = false,
  lockOrder = false,
  lockQuotation = false,
  orderLabel,
  quotationLabel,
  onSubmit,
}: Props) {
  const { showResult } = useActionFeedback();
  const paymentTermsQuery = usePaymentTerms();
  const [formError, setFormError] = useState<string | null>(null);
  const activeTaxRates = taxRates.filter((rate) => rate.isActive);
  const defaultTaxId =
    activeTaxRates.find((rate) => rate.isDefault)?.id ??
    activeTaxRates[0]?.id ??
    "";
  const paymentTerms = paymentTermsQuery.data ?? [];

  const initialValues = useMemo<InvoiceFormValues>(
    () => ({
      clientId: defaultValues?.clientId ?? "",
      orderId: defaultValues?.orderId ?? "",
      quotationId: defaultValues?.quotationId ?? "",
      invoiceType: defaultValues?.invoiceType ?? "standard",
      issueDate:
        defaultValues?.issueDate ?? new Date().toISOString().slice(0, 10),
      dueDate: defaultValues?.dueDate ?? "",
      currency: defaultValues?.currency ?? DEFAULT_CURRENCY,
      exchangeRate: defaultValues?.exchangeRate ?? 1,
      paymentTermId: defaultValues?.paymentTermId ?? "",
      globalDiscountPct: defaultValues?.globalDiscountPct ?? 0,
      notes: defaultValues?.notes ?? "",
      internalNotes: defaultValues?.internalNotes ?? "",
      lines:
        defaultValues?.lines && defaultValues.lines.length > 0
          ? defaultValues.lines
          : [defaultInvoiceLine(defaultTaxId)],
    }),
    [defaultValues, defaultTaxId],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormValues>,
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = watch("lines");
  const globalDiscountPct = watch("globalDiscountPct");
  const currency = watch("currency");
  const orderId = watch("orderId");
  const quotationId = watch("quotationId");

  const totals = useMemo(
    () =>
      computeQuotationTotals(
        watchedLines ?? [],
        globalDiscountPct ?? 0,
        activeTaxRates,
      ),
    [watchedLines, globalDiscountPct, activeTaxRates],
  );

  const handleFormSubmit = async (values: InvoiceFormValues) => {
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
          .getElementById("invoice-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<InvoiceFormValues> = (
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
          id="invoice-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <section className="space-y-4">
        <SectionTitle>En-tête</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2" data-form-field="clientId">
            <ClientSearchField
              value={watch("clientId")}
              disabled={lockClient}
              onChange={(clientId) =>
                setValue("clientId", clientId, { shouldValidate: true })
              }
            />
            {errors.clientId ? (
              <p className="mt-1 text-xs text-red-600">{errors.clientId.message}</p>
            ) : null}
          </div>
          <div data-form-field="invoiceType">
            <Label>
              Type de facture <span className="text-red-600">*</span>
            </Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("invoiceType")}
            >
              {INVOICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.invoiceType ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.invoiceType.message}
              </p>
            ) : null}
          </div>
          {orderId ? (
            <div data-form-field="orderId">
              <Label>BC source</Label>
              {lockOrder && orderLabel ? (
                <Link
                  href={`/commandes/${orderId}`}
                  className="mt-1 block text-sm font-medium text-brand-600 hover:underline"
                >
                  {orderLabel}
                </Link>
              ) : (
                <Input {...register("orderId")} disabled={lockOrder} />
              )}
              {errors.orderId ? (
                <p className="mt-1 text-xs text-red-600">{errors.orderId.message}</p>
              ) : null}
            </div>
          ) : null}
          {quotationId ? (
            <div data-form-field="quotationId">
              <Label>Devis source</Label>
              {lockQuotation && quotationLabel ? (
                <Link
                  href={`/devis/${quotationId}`}
                  className="mt-1 block text-sm font-medium text-brand-600 hover:underline"
                >
                  {quotationLabel}
                </Link>
              ) : (
                <Input {...register("quotationId")} disabled={lockQuotation} />
              )}
              {errors.quotationId ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.quotationId.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div data-form-field="issueDate">
            <Label>
              Date d&apos;émission <span className="text-red-600">*</span>
            </Label>
            <Input type="date" {...register("issueDate")} />
            {errors.issueDate ? (
              <p className="mt-1 text-xs text-red-600">{errors.issueDate.message}</p>
            ) : null}
          </div>
          <div data-form-field="dueDate">
            <Label>Date d&apos;échéance</Label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate ? (
              <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>
            ) : null}
          </div>
          <div>
            <Label>Devise</Label>
            <CurrencySelect {...register("currency")} />
          </div>
          <div data-form-field="exchangeRate">
            <Label>Taux de change</Label>
            <Input
              type="number"
              min={0.0001}
              step="0.0001"
              {...register("exchangeRate", { valueAsNumber: true })}
            />
            {errors.exchangeRate ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.exchangeRate.message}
              </p>
            ) : null}
          </div>
          <div data-form-field="paymentTermId">
            <Label>Conditions de paiement</Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("paymentTermId")}
            >
              <option value="">— Aucune —</option>
              {paymentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.days} j)
                </option>
              ))}
            </select>
            {errors.paymentTermId ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.paymentTermId.message}
              </p>
            ) : null}
          </div>
          <div data-form-field="globalDiscountPct">
            <Label>Remise globale (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...register("globalDiscountPct", { valueAsNumber: true })}
            />
            {errors.globalDiscountPct ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.globalDiscountPct.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4" data-form-field="lines">
        <SectionTitle>Lignes</SectionTitle>
        {errors.lines?.message ? (
          <p className="text-xs text-red-600">{errors.lines.message}</p>
        ) : null}
        <div className="space-y-3">
          {fields.map((field, index) => {
            const lineErrors = errors.lines?.[index];
            return (
            <div
              key={field.id}
              data-form-field={`lines.${index}`}
              className={`grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-12 ${
                lineErrors
                  ? "border-red-300 dark:border-red-500/40"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="md:col-span-3">
                <ItemPicker
                  onSelect={(item) => {
                    setValue(`lines.${index}.itemId`, item.id);
                    setValue(`lines.${index}.description`, item.name);
                    setValue(`lines.${index}.unitPriceHt`, item.priceHt);
                    setValue(
                      `lines.${index}.taxRateId`,
                      item.defaultTaxRateId || defaultTaxId,
                    );
                  }}
                />
              </div>
              <div
                className="md:col-span-3"
                data-form-field={`lines.${index}.description`}
              >
                <Label>Description</Label>
                <Input
                  {...register(`lines.${index}.description`)}
                  error={Boolean(lineErrors?.description)}
                />
                {lineErrors?.description ? (
                  <p className="mt-1 text-xs text-red-600">
                    {lineErrors.description.message}
                  </p>
                ) : null}
              </div>
              <div
                className="md:col-span-1"
                data-form-field={`lines.${index}.quantity`}
              >
                <Label>Qté</Label>
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  error={Boolean(lineErrors?.quantity)}
                  {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                />
                {lineErrors?.quantity ? (
                  <p className="mt-1 text-xs text-red-600">
                    {lineErrors.quantity.message}
                  </p>
                ) : null}
              </div>
              <div
                className="md:col-span-2"
                data-form-field={`lines.${index}.unitPriceHt`}
              >
                <Label>Prix unit. HT</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  error={Boolean(lineErrors?.unitPriceHt)}
                  {...register(`lines.${index}.unitPriceHt`, { valueAsNumber: true })}
                />
                {lineErrors?.unitPriceHt ? (
                  <p className="mt-1 text-xs text-red-600">
                    {lineErrors.unitPriceHt.message}
                  </p>
                ) : null}
              </div>
              <div
                className="md:col-span-1"
                data-form-field={`lines.${index}.discountPct`}
              >
                <Label>Rem. %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  error={Boolean(lineErrors?.discountPct)}
                  {...register(`lines.${index}.discountPct`, { valueAsNumber: true })}
                />
                {lineErrors?.discountPct ? (
                  <p className="mt-1 text-xs text-red-600">
                    {lineErrors.discountPct.message}
                  </p>
                ) : null}
              </div>
              <div
                className="md:col-span-1"
                data-form-field={`lines.${index}.taxRateId`}
              >
                <Label>TVA</Label>
                <select
                  className={`h-11 w-full rounded-lg border px-2 text-sm dark:bg-gray-900 ${
                    lineErrors?.taxRateId
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  {...register(`lines.${index}.taxRateId`)}
                >
                  {activeTaxRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.rate}%
                    </option>
                  ))}
                </select>
                {lineErrors?.taxRateId ? (
                  <p className="mt-1 text-xs text-red-600">
                    {lineErrors.taxRateId.message}
                  </p>
                ) : null}
              </div>
              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="h-11 w-full rounded-lg border border-red-200 text-sm text-red-600 disabled:opacity-40"
                >
                  Suppr.
                </button>
              </div>
            </div>
          );
          })}
        </div>
        <button
          type="button"
          onClick={() => append(defaultInvoiceLine(defaultTaxId))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Ajouter une ligne
        </button>
      </section>

      <section className="space-y-4">
        <SectionTitle>Mentions</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2" data-form-field="notes">
            <Label>Mentions légales / conditions</Label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
            ) : null}
          </div>
          <div className="md:col-span-2" data-form-field="internalNotes">
            <Label>Notes internes</Label>
            <textarea
              className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              {...register("internalNotes")}
            />
            {errors.internalNotes ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.internalNotes.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <QuotationTotalsPanel totals={totals} currency={currency} />

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

function buildInvoiceLines(values: InvoiceFormValues) {
  return values.lines.map((line) => ({
    ...(line.itemId ? { itemId: line.itemId } : {}),
    description: line.description.trim(),
    quantity: line.quantity,
    unitPriceHt: line.unitPriceHt,
    ...(line.discountPct > 0 ? { discountPct: line.discountPct } : {}),
    taxRateId: line.taxRateId,
  }));
}

export function buildCreateInvoicePayload(
  values: InvoiceFormValues,
): CreateInvoicePayload {
  return {
    clientId: values.clientId,
    invoiceType: values.invoiceType,
    issueDate: values.issueDate,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    discountPct: values.globalDiscountPct,
    ...(values.dueDate ? { dueDate: values.dueDate } : {}),
    ...(values.paymentTermId ? { paymentTermId: values.paymentTermId } : {}),
    ...(values.orderId ? { orderId: values.orderId } : {}),
    ...(values.quotationId ? { quotationId: values.quotationId } : {}),
    ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    ...(values.internalNotes?.trim()
      ? { internalNotes: values.internalNotes.trim() }
      : {}),
    lines: buildInvoiceLines(values),
  };
}

export function buildUpdateInvoicePayload(
  values: InvoiceFormValues,
): UpdateInvoicePayload {
  return {
    invoiceType: values.invoiceType,
    issueDate: values.issueDate,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    discountPct: values.globalDiscountPct,
    ...(values.dueDate ? { dueDate: values.dueDate } : {}),
    ...(values.paymentTermId ? { paymentTermId: values.paymentTermId } : {}),
    ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    ...(values.internalNotes?.trim()
      ? { internalNotes: values.internalNotes.trim() }
      : {}),
    lines: buildInvoiceLines(values),
  };
}
