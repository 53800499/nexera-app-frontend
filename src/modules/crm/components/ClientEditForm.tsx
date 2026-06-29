"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { CurrencySelect } from "@/shared/components/form/CurrencySelect";
import {
  clientEditSchema,
  type ClientEditFormValues,
} from "../schemas/clientForm.schema";

type Props = {
  clientCode: string;
  isSubmitting: boolean;
  submitLabel: string;
  defaultValues: ClientEditFormValues;
  onSubmit: (values: ClientEditFormValues) => Promise<void>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700">
      {children}
    </h3>
  );
}

export function ClientEditForm({
  clientCode,
  isSubmitting,
  submitLabel,
  defaultValues,
  onSubmit,
}: Props) {
  const initialValues = useMemo(() => defaultValues, [defaultValues]);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema),
    defaultValues: initialValues,
  });

  const useShippingAddress = watch("useShippingAddress");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-xs uppercase tracking-wide text-gray-500">Code client</p>
        <p className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
          {clientCode}
        </p>
        <p className="mt-1 text-xs text-gray-500">Non modifiable (RM-C01)</p>
      </div>

      <section className="space-y-4">
        <SectionTitle>Identité</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Type</Label>
            <select
              {...register("clientType")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="company">Entreprise</option>
              <option value="individual">Particulier</option>
            </select>
          </div>
          <div>
            <Label>
              Raison sociale / Nom <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("companyName")}
              error={Boolean(errors.companyName)}
              hint={errors.companyName?.message}
            />
          </div>
          <div>
            <Label>Nom commercial</Label>
            <Input {...register("tradeName")} />
          </div>
          <div>
            <Label>SIRET / RCCM</Label>
            <Input {...register("siret")} />
          </div>
          <div>
            <Label>IFU</Label>
            <Input {...register("taxId")} />
          </div>
          <div>
            <Label>Secteur</Label>
            <Input {...register("sector")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Adresse de facturation</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              Rue <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("billingAddress.street")}
              error={Boolean(errors.billingAddress?.street)}
              hint={errors.billingAddress?.street?.message}
            />
          </div>
          <div>
            <Label>
              Ville <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("billingAddress.city")}
              error={Boolean(errors.billingAddress?.city)}
              hint={errors.billingAddress?.city?.message}
            />
          </div>
          <div>
            <Label>
              Code postal <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("billingAddress.postalCode")}
              error={Boolean(errors.billingAddress?.postalCode)}
              hint={errors.billingAddress?.postalCode?.message}
            />
          </div>
          <div>
            <Label>
              Pays <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("billingAddress.country")}
              error={Boolean(errors.billingAddress?.country)}
              hint={errors.billingAddress?.country?.message}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Controller
          name="useShippingAddress"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value ?? false} onChange={field.onChange} />
              Adresse de livraison différente
            </label>
          )}
        />
        {useShippingAddress ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Rue</Label>
              <Input {...register("shippingAddress.street")} />
            </div>
            <div>
              <Label>Ville</Label>
              <Input {...register("shippingAddress.city")} />
            </div>
            <div>
              <Label>Code postal</Label>
              <Input {...register("shippingAddress.postalCode")} />
            </div>
            <div>
              <Label>Pays</Label>
              <Input {...register("shippingAddress.country")} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <SectionTitle>Conditions commerciales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Devise</Label>
            <CurrencySelect
              {...register("defaultCurrency")}
              error={Boolean(errors.defaultCurrency)}
              hint={errors.defaultCurrency?.message}
            />
          </div>
          <div>
            <Label>Remise par défaut (%)</Label>
            <Input
              type="number"
              {...register("defaultDiscountPct", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label>Plafond d&apos;encours</Label>
            <Input
              type="number"
              {...register("creditLimit", { valueAsNumber: true })}
            />
          </div>
        </div>
        <div>
          <Label>Notes internes</Label>
          <Input {...register("notes")} />
        </div>
        <Controller
          name="remindersDisabled"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value ?? false} onChange={field.onChange} />
              Désactiver les relances automatiques
            </label>
          )}
        />
        {watch("remindersDisabled") ? (
          <div>
            <Label>Motif</Label>
            <Input {...register("remindersDisabledReason")} />
          </div>
        ) : null}
      </section>

      <Button size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
