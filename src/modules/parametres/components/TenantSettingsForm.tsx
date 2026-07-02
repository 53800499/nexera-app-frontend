"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import {
  buildFormHydrationKey,
  useHydrateFormDefaults,
} from "@/shared/forms/useHydrateFormDefaults";
import {
  tenantSettingsSchema,
  type TenantSettingsFormValues,
} from "../schemas/settingsForm.schema";
import type { TenantSettings } from "../types/settings.types";

type Props = {
  settings: TenantSettings;
  isSubmitting: boolean;
  readOnly?: boolean;
  onSubmit: (values: TenantSettingsFormValues) => Promise<void>;
};

function toFormValues(settings: TenantSettings): TenantSettingsFormValues {
  return {
    primaryCurrency: settings.primaryCurrency ?? DEFAULT_CURRENCY,
    exchangeRateSource: settings.exchangeRateSource ?? "manual",
    latePaymentPenaltyRate:
      settings.latePaymentPenaltyRate != null
        ? String(settings.latePaymentPenaltyRate)
        : "",
    latePaymentPenaltyText: settings.latePaymentPenaltyText ?? "",
    legalName: settings.legalName ?? "",
    tradeName: settings.tradeName ?? "",
    siret: settings.siret ?? "",
    vatNumber: settings.vatNumber ?? "",
    registrationNumber: settings.registrationNumber ?? "",
    shareCapital: settings.shareCapital ?? "",
    street: settings.companyAddress?.street ?? "",
    city: settings.companyAddress?.city ?? "",
    postalCode: settings.companyAddress?.postalCode ?? "",
    country: settings.companyAddress?.country ?? "",
    companyPhone: settings.companyPhone ?? "",
    companyEmail: settings.companyEmail ?? "",
    companyWebsite: settings.companyWebsite ?? "",
    acceptedPaymentMethods: settings.acceptedPaymentMethods ?? "",
    cgvText: settings.cgvText ?? "",
  };
}

export function TenantSettingsForm({
  settings,
  isSubmitting,
  readOnly = false,
  onSubmit,
}: Props) {
  const toast = useToast();
  const initialValues = useMemo(() => toFormValues(settings), [settings]);
  const hydrationKey = buildFormHydrationKey(initialValues);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenantSettingsFormValues>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: initialValues,
  });

  useHydrateFormDefaults(reset, initialValues, hydrationKey);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      toast.success("Paramètres enregistrés");
    } catch (error) {
      toast.error(
        "Enregistrement impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <ComponentCard
        title="Finance"
        desc="Devise, taux de change et pénalités de retard."
        className="!bg-transparent !shadow-none"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Devise principale</Label>
            <Input
              {...register("primaryCurrency")}
              disabled={readOnly}
              error={Boolean(errors.primaryCurrency)}
              hint={errors.primaryCurrency?.message}
            />
          </div>
          <div>
            <Label>Source des taux de change</Label>
            <select
              {...register("exchangeRateSource")}
              disabled={readOnly}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="manual">Manuel</option>
              <option value="api">API</option>
            </select>
          </div>
          <div>
            <Label>Pénalités de retard (% annuel)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("latePaymentPenaltyRate")}
              disabled={readOnly}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Texte pénalités de retard</Label>
            <textarea
              {...register("latePaymentPenaltyText")}
              disabled={readOnly}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Identité entreprise"
        desc="Informations légales affichées sur vos documents."
        className="!bg-transparent !shadow-none"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Raison sociale</Label>
            <Input {...register("legalName")} disabled={readOnly} />
          </div>
          <div>
            <Label>Nom commercial</Label>
            <Input {...register("tradeName")} disabled={readOnly} />
          </div>
          <div>
            <Label>SIRET</Label>
            <Input {...register("siret")} disabled={readOnly} />
          </div>
          <div>
            <Label>N° TVA</Label>
            <Input {...register("vatNumber")} disabled={readOnly} />
          </div>
          <div>
            <Label>RCS / immatriculation</Label>
            <Input {...register("registrationNumber")} disabled={readOnly} />
          </div>
          <div>
            <Label>Capital social</Label>
            <Input {...register("shareCapital")} disabled={readOnly} />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Coordonnées & mentions"
        desc="Adresse, contacts et conditions générales."
        className="!bg-transparent !shadow-none"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Adresse</Label>
            <Input {...register("street")} disabled={readOnly} />
          </div>
          <div>
            <Label>Ville</Label>
            <Input {...register("city")} disabled={readOnly} />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input {...register("postalCode")} disabled={readOnly} />
          </div>
          <div>
            <Label>Pays</Label>
            <Input {...register("country")} disabled={readOnly} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...register("companyPhone")} disabled={readOnly} />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              {...register("companyEmail")}
              disabled={readOnly}
              error={Boolean(errors.companyEmail)}
              hint={errors.companyEmail?.message}
            />
          </div>
          <div>
            <Label>Site web</Label>
            <Input {...register("companyWebsite")} disabled={readOnly} />
          </div>
          <div className="md:col-span-2">
            <Label>Modes de paiement acceptés</Label>
            <Input {...register("acceptedPaymentMethods")} disabled={readOnly} />
          </div>
          <div className="md:col-span-2">
            <Label>CGV (texte PDF)</Label>
            <textarea
              {...register("cgvText")}
              disabled={readOnly}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
      </ComponentCard>

      {!readOnly ? (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          <p className="text-sm text-gray-500">
            {isDirty
              ? "Des modifications non enregistrées sont en cours."
              : "Toutes les modifications sont à jour."}
          </p>
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
