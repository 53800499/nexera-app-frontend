"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import {
  Controller,
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
import type {
  CreateUserPayload,
  RoleSummary,
  UpdateUserPayload,
} from "../types/user.types";
import {
  createUserFormSchema,
  updateUserFormSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "../schemas/userForm.schema";

type BaseProps = {
  roles: RoleSummary[];
  isSubmitting: boolean;
  onCancel?: () => void;
  /** Identifiant stable de la source (ex. user.id) pour éviter un reset après erreur. */
  formKey?: string;
};

type CreateProps = BaseProps & {
  mode: "create";
  defaultValues?: Partial<CreateUserFormValues>;
  submitLabel: string;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
};

type UpdateProps = BaseProps & {
  mode: "update";
  defaultValues?: Partial<UpdateUserFormValues>;
  submitLabel: string;
  onSubmit: (values: UpdateUserFormValues) => Promise<void>;
};

type Props = CreateProps | UpdateProps;

export function buildCreateUserPayload(
  values: CreateUserFormValues,
): CreateUserPayload {
  return {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    password: values.password || undefined,
    isActive: values.isActive,
    requestPasswordReset: values.requestPasswordReset,
    roleIds: values.roleIds ?? [],
  };
}

export function buildUpdateUserPayload(
  values: UpdateUserFormValues,
): UpdateUserPayload {
  return {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    password: values.password || undefined,
    isActive: values.isActive,
  };
}

export function UserForm(props: Props) {
  const { roles, isSubmitting, onCancel, mode, submitLabel, onSubmit, formKey } =
    props;
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const defaultValues =
    mode === "create"
      ? (props as CreateProps).defaultValues
      : (props as UpdateProps).defaultValues;

  const initialValues = useMemo(() => {
    if (mode === "create") {
      const createDefaults = defaultValues as
        | Partial<CreateUserFormValues>
        | undefined;
      return {
        email: createDefaults?.email ?? "",
        firstName: createDefaults?.firstName ?? "",
        lastName: createDefaults?.lastName ?? "",
        password: createDefaults?.password ?? "",
        isActive: createDefaults?.isActive ?? true,
        requestPasswordReset: createDefaults?.requestPasswordReset ?? false,
        roleIds: createDefaults?.roleIds ?? [],
      } satisfies CreateUserFormValues;
    }

    return {
      email: defaultValues?.email ?? "",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      password: defaultValues?.password ?? "",
      isActive: defaultValues?.isActive ?? true,
      roleIds: defaultValues?.roleIds ?? [],
    } satisfies UpdateUserFormValues;
  }, [
    mode,
    defaultValues?.email,
    defaultValues?.firstName,
    defaultValues?.lastName,
    defaultValues?.password,
    defaultValues?.isActive,
    defaultValues?.roleIds,
    mode === "create"
      ? (defaultValues as Partial<CreateUserFormValues> | undefined)
          ?.requestPasswordReset
      : undefined,
  ]);

  const hydrationKey =
    formKey ?? buildFormHydrationKey({ mode, defaults: defaultValues ?? {} });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(
      mode === "create" ? createUserFormSchema : updateUserFormSchema,
    ),
    defaultValues: initialValues,
  });

  useHydrateFormDefaults(reset, initialValues, hydrationKey);

  const handleFormSubmit = async (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    setFormError(null);
    try {
      if (mode === "create") {
        await (onSubmit as CreateProps["onSubmit"])(
          values as CreateUserFormValues,
        );
      } else {
        await (onSubmit as UpdateProps["onSubmit"])(
          values as UpdateUserFormValues,
        );
      }
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
          .getElementById("user-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<
    CreateUserFormValues | UpdateUserFormValues
  > = (fieldErrors) => {
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
          id="user-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Identité
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div data-form-field="email">
            <Label>Email</Label>
            <Input
              {...register("email")}
              type="email"
              error={Boolean(errors.email)}
              hint={errors.email?.message}
            />
          </div>
          <div data-form-field="password">
            <Label>
              {mode === "create"
                ? "Mot de passe (optionnel)"
                : "Nouveau mot de passe (optionnel)"}
            </Label>
            <Input
              {...register("password")}
              type="password"
              error={Boolean(errors.password)}
              hint={
                errors.password?.message ??
                (mode === "create"
                  ? "Laissé vide : mot de passe généré et envoyé par email."
                  : "Laissé vide : le mot de passe actuel est conservé.")
              }
            />
          </div>
          <div data-form-field="firstName">
            <Label>Prénom</Label>
            <Input
              {...register("firstName")}
              error={Boolean(errors.firstName)}
              hint={errors.firstName?.message}
            />
          </div>
          <div data-form-field="lastName">
            <Label>Nom</Label>
            <Input
              {...register("lastName")}
              error={Boolean(errors.lastName)}
              hint={errors.lastName?.message}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4" data-form-field="roleIds">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Rôles
        </h2>
        <Controller
          name="roleIds"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {roles.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun rôle disponible. Créez d&apos;abord un rôle dans
                  Paramètres → Rôles.
                </p>
              ) : (
                roles.map((role) => {
                  const checked = (field.value ?? []).includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        checked
                          ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const current = field.value ?? [];
                          field.onChange(
                            event.target.checked
                              ? [...current, role.id]
                              : current.filter((id) => id !== role.id),
                          );
                        }}
                      />
                      <span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {role.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {role.code}
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        />
        {errors.roleIds ? (
          <p className="text-xs text-red-600">{errors.roleIds.message}</p>
        ) : null}
      </section>

      <section className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isActive")} />
          Utilisateur actif
        </label>
        {mode === "create" ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("requestPasswordReset")} />
            Forcer la réinitialisation du mot de passe à la première connexion
          </label>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting}>
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
