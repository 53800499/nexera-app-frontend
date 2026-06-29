"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CurrencySelect } from "@/shared/components/form/CurrencySelect";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { clientsApi } from "@/modules/crm/services/clientsApi.service";
import type { ClientSummary } from "@/modules/crm/types/client.types";
import {
  catalogPriceEditFormSchema,
  catalogPriceFormSchema,
  type CatalogPriceEditFormValues,
  type CatalogPriceFormValues,
} from "../schemas/catalogItemForm.schema";
import type { CatalogItemPrice } from "../types/catalogue.types";
import { priceTargetLabel } from "../utils/catalogPriceMappers";

type BaseProps = {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
};

type CreateProps = BaseProps & {
  mode: "create";
  defaultValues?: Partial<CatalogPriceFormValues>;
  onSubmit: (values: CatalogPriceFormValues, clientId?: string) => Promise<void>;
};

type EditProps = BaseProps & {
  mode: "edit";
  price: CatalogItemPrice;
  defaultValues: CatalogPriceEditFormValues;
  onSubmit: (values: CatalogPriceEditFormValues) => Promise<void>;
};

type Props = CreateProps | EditProps;

export function CatalogPriceForm(props: Props) {
  if (props.mode === "edit") {
    return <CatalogPriceEditForm {...props} />;
  }
  return <CatalogPriceCreateForm {...props} />;
}

function CatalogPriceEditForm({
  price,
  defaultValues,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: EditProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogPriceEditFormValues>({
    resolver: zodResolver(catalogPriceEditFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Cible du tarif
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {priceTargetLabel(price)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Prix HT</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("priceHt", { valueAsNumber: true })}
            error={Boolean(errors.priceHt)}
            hint={errors.priceHt?.message}
          />
        </div>
        <div>
          <Label>Devise</Label>
          <CurrencySelect
            {...register("currency")}
            error={Boolean(errors.currency)}
            hint={errors.currency?.message}
          />
        </div>
        <div>
          <Label>Valide du</Label>
          <Input type="date" {...register("validFrom")} />
        </div>
        <div>
          <Label>Valide jusqu&apos;au</Label>
          <Input type="date" {...register("validTo")} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                label="Tarif actif"
              />
            )}
          />
        </div>
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  );
}

function CatalogPriceCreateForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: CreateProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(
    null,
  );

  const initialValues = useMemo<CatalogPriceFormValues>(
    () => ({
      priceHt: defaultValues?.priceHt ?? 0,
      currency: defaultValues?.currency ?? DEFAULT_CURRENCY,
      clientId: defaultValues?.clientId,
      groupName: defaultValues?.groupName ?? "",
      validFrom: defaultValues?.validFrom ?? "",
      validTo: defaultValues?.validTo ?? "",
      isActive: defaultValues?.isActive ?? true,
    }),
    [defaultValues],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CatalogPriceFormValues>({
    resolver: zodResolver(catalogPriceFormSchema),
    defaultValues: initialValues,
  });

  const searchClients = async () => {
    const q = clientSearch.trim();
    if (q.length < 2) return;
    const results = await clientsApi.search(q);
    setClientResults(results.items);
  };

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(values, selectedClient?.id),
      )}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Groupe de clients</Label>
          <Input
            {...register("groupName")}
            placeholder="Ex. VIP, Grossistes..."
            hint={errors.groupName?.message}
            error={Boolean(errors.groupName)}
          />
        </div>
        <div>
          <Label>Client (recherche)</Label>
          <div className="flex gap-2">
            <Input
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
              placeholder="Nom, code..."
            />
            <button
              type="button"
              onClick={searchClients}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700"
            >
              Chercher
            </button>
          </div>
          {selectedClient ? (
            <p className="mt-1 text-xs text-brand-600">
              Sélectionné : {selectedClient.companyName}
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => {
                  setSelectedClient(null);
                  setValue("clientId", undefined);
                }}
              >
                Retirer
              </button>
            </p>
          ) : null}
          {clientResults.length > 0 && !selectedClient ? (
            <ul className="mt-2 max-h-32 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
              {clientResults.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      setSelectedClient(client);
                      setValue("clientId", client.id);
                      setClientResults([]);
                    }}
                  >
                    {client.companyName}{" "}
                    <span className="text-gray-500">({client.code})</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <Label>Prix HT</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("priceHt", { valueAsNumber: true })}
            error={Boolean(errors.priceHt)}
            hint={errors.priceHt?.message}
          />
        </div>
        <div>
          <Label>Devise</Label>
          <CurrencySelect
            {...register("currency")}
            error={Boolean(errors.currency)}
            hint={errors.currency?.message}
          />
        </div>
        <div>
          <Label>Valide du</Label>
          <Input type="date" {...register("validFrom")} />
        </div>
        <div>
          <Label>Valide jusqu&apos;au</Label>
          <Input type="date" {...register("validTo")} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? true}
                onChange={field.onChange}
                label="Tarif actif"
              />
            )}
          />
        </div>
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  );
}

function FormActions({
  isSubmitting,
  submitLabel,
  onCancel,
}: {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700"
        >
          Annuler
        </button>
      ) : null}
      <Button disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </Button>
    </div>
  );
}
