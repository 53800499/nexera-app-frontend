"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { AppError } from "@/shared/core/AppError";
import { useToast } from "@/shared/components/feedback";
import { useCabinetAccessGrant } from "../hooks/useCabinetAccessGrant";
import { CabinetPermissionPicker } from "./CabinetPermissionPicker";
import {
  grantCabinetAccessSchema,
  type GrantCabinetAccessFormValues,
} from "../schemas/grantCabinetAccess.schema";
import {
  DEFAULT_CABINET_SCOPE_PERMISSIONS,
  type CabinetScopePermissionCode,
} from "../constants/cabinetPermissionLabels";

type Props = {
  canManage: boolean;
};

export function GrantCabinetAccessForm({ canManage }: Props) {
  const toast = useToast();
  const { grantMutation } = useCabinetAccessGrant();
  const [permissions, setPermissions] = useState<CabinetScopePermissionCode[]>([
    ...DEFAULT_CABINET_SCOPE_PERMISSIONS,
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Pick<GrantCabinetAccessFormValues, "inviteCode">>({
    resolver: zodResolver(grantCabinetAccessSchema.pick({ inviteCode: true })),
    defaultValues: { inviteCode: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (permissions.length === 0) {
      toast.error("Sélectionnez au moins un droit à accorder.");
      return;
    }

    try {
      await grantMutation.mutateAsync({
        inviteCode: values.inviteCode.trim(),
        permissions,
      });
      toast.success("Cabinet comptable autorisé avec succès.");
      reset();
      setPermissions([...DEFAULT_CABINET_SCOPE_PERMISSIONS]);
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Impossible d'autoriser ce cabinet.";
      toast.error(message);
    }
  });

  if (!canManage) {
    return (
      <p className="text-sm text-gray-500">
        Vous n&apos;avez pas la permission de modifier les accès cabinet.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="inviteCode">
          Code d&apos;invitation cabinet <span className="text-error-500">*</span>
        </Label>
        <Input
          id="inviteCode"
          placeholder="NEXR-A7K9-M3P2"
          autoComplete="off"
          spellCheck={false}
          {...register("inviteCode")}
          error={Boolean(errors.inviteCode)}
          hint={errors.inviteCode?.message}
        />
        <p className="mt-2 text-xs text-gray-500">
          Demandez ce code à votre expert-comptable (Paramètres → Code
          d&apos;invitation cabinet).
        </p>
      </div>

      <CabinetPermissionPicker
        value={permissions}
        onChange={setPermissions}
        disabled={grantMutation.isPending}
      />

      <Button size="sm" disabled={grantMutation.isPending}>
        {grantMutation.isPending ? "Autorisation..." : "Autoriser le cabinet"}
      </Button>
    </form>
  );
}
