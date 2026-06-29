"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/profileForm.schema";

type Props = {
  isSubmitting: boolean;
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
};

export function ChangePasswordForm({ isSubmitting, onSubmit }: Props) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset();
      toast.success("Mot de passe mis à jour");
    } catch (error) {
      toast.error(
        "Modification impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <h3 className="mb-1 text-base font-medium text-gray-800 dark:text-white/90">
        Mot de passe
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        Saisissez votre mot de passe actuel puis le nouveau (8 caractères minimum).
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Mot de passe actuel</Label>
          <Input
            type="password"
            {...register("currentPassword")}
            error={Boolean(errors.currentPassword)}
            hint={errors.currentPassword?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              {...register("newPassword")}
              error={Boolean(errors.newPassword)}
              hint={errors.newPassword?.message}
            />
          </div>
          <div>
            <Label>Confirmation</Label>
            <Input
              type="password"
              {...register("confirmPassword")}
              error={Boolean(errors.confirmPassword)}
              hint={errors.confirmPassword?.message}
            />
          </div>
        </div>
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </form>
    </div>
  );
}
