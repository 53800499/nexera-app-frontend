"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { CountryFlagsSelect } from "@/shared/components/form/CountryFlagsSelect";
import { CurrencySelect } from "@/shared/components/form/CurrencySelect";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import {
  addressToJson,
  clientFormSchema,
  type ClientFormValues,
} from "../schemas/clientForm.schema";
import { ClientDuplicateChecker } from "./ClientDuplicateChecker";

type Props = {
  isSubmitting: boolean;
  submitLabel: string;
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700">
      {children}
    </h3>
  );
}

export function ClientForm({
  isSubmitting,
  submitLabel,
  defaultValues,
  onSubmit,
}: Props) {
  const initialValues = useMemo<ClientFormValues>(
    () => ({
      clientType: defaultValues?.clientType ?? "company",
      companyName: defaultValues?.companyName ?? "",
      tradeName: defaultValues?.tradeName ?? "",
      siret: defaultValues?.siret ?? "",
      taxId: defaultValues?.taxId ?? "",
      sector: defaultValues?.sector ?? "",
      primaryContact: {
        firstName: defaultValues?.primaryContact?.firstName ?? "",
        lastName: defaultValues?.primaryContact?.lastName ?? "",
        jobTitle: defaultValues?.primaryContact?.jobTitle ?? "",
        email: defaultValues?.primaryContact?.email ?? "",
        phone: defaultValues?.primaryContact?.phone ?? "",
      },
      billingAddress: {
        street: defaultValues?.billingAddress?.street ?? "",
        city: defaultValues?.billingAddress?.city ?? "",
        postalCode: defaultValues?.billingAddress?.postalCode ?? "",
        country: defaultValues?.billingAddress?.country ?? "CI",
      },
      shippingAddress: defaultValues?.shippingAddress,
      useShippingAddress: defaultValues?.useShippingAddress ?? false,
      defaultCurrency: defaultValues?.defaultCurrency ?? DEFAULT_CURRENCY,
      defaultDiscountPct: defaultValues?.defaultDiscountPct ?? 0,
      creditLimit: defaultValues?.creditLimit,
      notes: defaultValues?.notes ?? "",
      remindersDisabled: defaultValues?.remindersDisabled ?? false,
      remindersDisabledReason: defaultValues?.remindersDisabledReason ?? "",
    }),
    [defaultValues],
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialValues,
  });

  const useShippingAddress = watch("useShippingAddress");
  const clientType = watch("clientType");
  const isCompany = clientType === "company";
  const isPostalCodeRequired = isCompany;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              {isCompany ? "Raison sociale" : "Nom"}{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register("companyName")}
              error={Boolean(errors.companyName)}
              hint={errors.companyName?.message}
            />
          </div>
          {isCompany ? (
            <>
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
            </>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Contact principal</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Prénom *</Label>
            <Input
              {...register("primaryContact.firstName")}
              error={Boolean(errors.primaryContact?.firstName)}
              hint={errors.primaryContact?.firstName?.message}
            />
          </div>
          <div>
            <Label>Nom <span className="text-red-600">*</span></Label>
            <Input
              {...register("primaryContact.lastName")}
              error={Boolean(errors.primaryContact?.lastName)}
              hint={errors.primaryContact?.lastName?.message}
            />
          </div>
          <div>
            <Label>Fonction</Label>
            <Input {...register("primaryContact.jobTitle")} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              {...register("primaryContact.email")}
              error={Boolean(errors.primaryContact?.email)}
              hint={errors.primaryContact?.email?.message}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...register("primaryContact.phone")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Adresse de facturation</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Rue <span className="text-red-600">*</span></Label>
            <Input
              {...register("billingAddress.street")}
              error={Boolean(errors.billingAddress?.street)}
              hint={errors.billingAddress?.street?.message}
            />
          </div>
          <div>
            <Label>Ville <span className="text-red-600">*</span></Label>
            <Input
              {...register("billingAddress.city")}
              error={Boolean(errors.billingAddress?.city)}
              hint={errors.billingAddress?.city?.message}
            />
          </div>
          <div>
            <Label>
              Code postal{" "}
              {isPostalCodeRequired ? <span className="text-red-600">*</span> : null}
            </Label>
            <Input
              {...register("billingAddress.postalCode")}
              error={Boolean(errors.billingAddress?.postalCode)}
              hint={errors.billingAddress?.postalCode?.message}
            />
          </div>
          <div>
            <Label>Pays <span className="text-red-600">*</span></Label>
            <Controller
              name="billingAddress.country"
              control={control}
              render={({ field }) => (
                <CountryFlagsSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={Boolean(errors.billingAddress?.country)}
                  hint={errors.billingAddress?.country?.message}
                />
              )}
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
              <Label>Rue <span className="text-red-600">*</span></Label>
              <Input {...register("shippingAddress.street")} />
            </div>
            <div>
              <Label>Ville <span className="text-red-600">*</span></Label>
              <Input {...register("shippingAddress.city")} />
            </div>
            <div>
              <Label>Code postal</Label>
              <Input {...register("shippingAddress.postalCode")} />
            </div>
            <div>
              <Label>Pays <span className="text-red-600">*</span></Label>
              <Controller
                name="shippingAddress.country"
                control={control}
                render={({ field }) => (
                  <CountryFlagsSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={Boolean(errors.shippingAddress?.country)}
                    hint={errors.shippingAddress?.country?.message}
                  />
                )}
              />
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

      <ClientDuplicateChecker
        siret={isCompany ? watch("siret") : ""}
        taxId={isCompany ? watch("taxId") : ""}
        email={watch("primaryContact.email")}
        companyName={watch("companyName")}
      />

      <Button size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}

export function buildCreateClientPayload(
  values: ClientFormValues,
  confirmDuplicate = false,
) {
  const isCompany = values.clientType === "company";

  return {
    clientType: values.clientType,
    companyName: values.companyName,
    tradeName: isCompany ? values.tradeName || undefined : undefined,
    siret: isCompany ? values.siret || undefined : undefined,
    taxId: isCompany ? values.taxId || undefined : undefined,
    sector: isCompany ? values.sector || undefined : undefined,
    primaryContact: {
      firstName: values.primaryContact.firstName,
      lastName: values.primaryContact.lastName,
      jobTitle: values.primaryContact.jobTitle || undefined,
      email: values.primaryContact.email || undefined,
      phone: values.primaryContact.phone || undefined,
      isPrimary: true,
    },
    billingAddress: addressToJson(values.billingAddress),
    shippingAddress:
      values.useShippingAddress && values.shippingAddress
        ? addressToJson(values.shippingAddress)
        : undefined,
    defaultCurrency: values.defaultCurrency,
    defaultDiscountPct: values.defaultDiscountPct,
    creditLimit: values.creditLimit,
    notes: values.notes || undefined,
    remindersDisabled: values.remindersDisabled,
    remindersDisabledReason: values.remindersDisabledReason || undefined,
    confirmDuplicate,
  };
}
