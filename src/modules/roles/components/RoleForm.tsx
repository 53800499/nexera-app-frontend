"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import type { Permission } from "../types/role.types";
import { groupPermissions } from "../utils/permissionGroups";
import { roleFormSchema, type RoleFormValues } from "../schemas/roleForm.schema";

type Props = {
  permissions: Permission[];
  isSubmitting: boolean;
  defaultValues?: Partial<RoleFormValues>;
  submitLabel: string;
  showPermissions?: boolean;
  onSubmit: (values: RoleFormValues) => Promise<void>;
};

export function RoleForm({
  permissions,
  isSubmitting,
  defaultValues,
  submitLabel,
  showPermissions = true,
  onSubmit,
}: Props) {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
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
        <div>
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

      <div>
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
        <div>
          <Label>Permissions initiales</Label>
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

      <Button size="sm" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
