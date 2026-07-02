"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import {
  useForm,
  type SubmitErrorHandler,
} from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useActionFeedback } from "@/shared/components/feedback";
import {
  focusFirstFormError,
  scrollToFormField,
} from "@/shared/forms/formErrorFocus";
import {
  buildFormHydrationKey,
  useHydrateFormDefaults,
} from "@/shared/forms/useHydrateFormDefaults";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import type { CreateRolePayload, Permission } from "../types/role.types";
import { groupPermissions } from "../utils/permissionGroups";
import { roleFormSchema, type RoleFormValues } from "../schemas/roleForm.schema";

type Props = {
  permissions: Permission[];
  isSubmitting: boolean;
  defaultValues?: Partial<RoleFormValues>;
  submitLabel: string;
  showPermissions?: boolean;
  /** Identifiant stable (ex. "create") pour éviter un reset après erreur. */
  formKey?: string;
  onCancel?: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
};

export function buildCreateRolePayload(
  values: RoleFormValues,
  tenantId: string,
): CreateRolePayload {
  return {
    name: values.name,
    code: values.code.toUpperCase(),
    description: values.description || undefined,
    tenantId,
    permissionIds: values.permissionIds,
  };
}

export function RoleForm({
  permissions,
  isSubmitting,
  defaultValues,
  submitLabel,
  showPermissions = true,
  formKey,
  onCancel,
  onSubmit,
}: Props) {
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  const initialValues = useMemo<RoleFormValues>(
    () => ({
      name: defaultValues?.name ?? "",
      code: defaultValues?.code ?? "",
      description: defaultValues?.description ?? "",
      permissionIds: defaultValues?.permissionIds ?? [],
    }),
    [defaultValues],
  );

  const hydrationKey =
    formKey ?? buildFormHydrationKey({ defaults: defaultValues ?? {} });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: initialValues,
  });

  useHydrateFormDefaults(reset, initialValues, hydrationKey);

  const handleFormSubmit = async (values: RoleFormValues) => {
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
          .getElementById("role-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<RoleFormValues> = (fieldErrors) => {
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
      className="space-y-6"
      noValidate
    >
      {formError ? (
        <p
          id="role-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div data-form-field="name">
          <Label>
            Nom du rôle <span className="text-error-500">*</span>
          </Label>
          <Input
            {...register("name")}
            type="text"
            placeholder="Commercial"
            error={Boolean(errors.name)}
            hint={errors.name?.message}
          />
        </div>
        <div data-form-field="code">
          <Label>
            Code <span className="text-error-500">*</span>
          </Label>
          <Input
            {...register("code")}
            type="text"
            placeholder="SALES"
            error={Boolean(errors.code)}
            hint={errors.code?.message}
          />
        </div>
      </div>

      <div data-form-field="description">
        <Label>Description</Label>
        <Input
          {...register("description")}
          type="text"
          placeholder="Description du rôle"
          error={Boolean(errors.description)}
          hint={errors.description?.message}
        />
      </div>

      {showPermissions && permissions.length > 0 ? (
        <div data-form-field="permissionIds">
          <Label>Permissions initiales</Label>
          {errors.permissionIds ? (
            <p className="mb-2 text-xs text-red-600">
              {errors.permissionIds.message}
            </p>
          ) : null}
          <div className="mt-3 space-y-4">
            {Object.entries(groupedPermissions).map(([group, items]) => (
              <div
                key={group}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {group}
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {items.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start gap-2 rounded border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                    >
                      <input
                        type="checkbox"
                        value={permission.id}
                        className="mt-1"
                        {...register("permissionIds")}
                      />
                      <span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {permission.code}
                        </span>
                        {permission.description ? (
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {permission.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button size="sm" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
