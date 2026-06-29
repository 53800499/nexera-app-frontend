"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import type { RoleSummary } from "../types/user.types";
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

export function UserForm(props: Props) {
  const { roles, isSubmitting, onCancel, mode, submitLabel, onSubmit } = props;

  const initialValues = useMemo(() => {
    if (mode === "create") {
      const defaults = props.defaultValues;
      return {
        email: defaults?.email ?? "",
        firstName: defaults?.firstName ?? "",
        lastName: defaults?.lastName ?? "",
        password: defaults?.password ?? "",
        isActive: defaults?.isActive ?? true,
        requestPasswordReset: defaults?.requestPasswordReset ?? false,
        roleIds: defaults?.roleIds ?? [],
      } satisfies CreateUserFormValues;
    }

    const defaults = props.defaultValues;
    return {
      email: defaults?.email ?? "",
      firstName: defaults?.firstName ?? "",
      lastName: defaults?.lastName ?? "",
      password: defaults?.password ?? "",
      isActive: defaults?.isActive ?? true,
      roleIds: defaults?.roleIds ?? [],
    } satisfies UpdateUserFormValues;
  }, [mode, props]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(
      mode === "create" ? createUserFormSchema : updateUserFormSchema,
    ),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(values as CreateUserFormValues & UpdateUserFormValues),
      )}
      className="space-y-6"
    >
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Identité
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input
              {...register("email")}
              type="email"
              error={Boolean(errors.email)}
              hint={errors.email?.message}
            />
          </div>
          <div>
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
          <div>
            <Label>Prénom</Label>
            <Input
              {...register("firstName")}
              error={Boolean(errors.firstName)}
              hint={errors.firstName?.message}
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              {...register("lastName")}
              error={Boolean(errors.lastName)}
              hint={errors.lastName?.message}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
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
