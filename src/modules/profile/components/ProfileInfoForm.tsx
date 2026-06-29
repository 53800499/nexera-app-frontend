"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  profileInfoSchema,
  type ProfileInfoFormValues,
} from "../schemas/profileForm.schema";

type Props = {
  defaultValues: ProfileInfoFormValues;
  isSubmitting: boolean;
  onSubmit: (values: ProfileInfoFormValues) => Promise<void>;
};

export function ProfileInfoForm({
  defaultValues,
  isSubmitting,
  onSubmit,
}: Props) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      toast.success("Profil mis à jour");
    } catch (error) {
      toast.error(
        "Mise à jour impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Informations personnelles
      </h3>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div className="md:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              {...register("email")}
              error={Boolean(errors.email)}
              hint={errors.email?.message}
            />
          </div>
        </div>
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
