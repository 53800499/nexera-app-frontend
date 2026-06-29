"use client";

import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "../constants/routes";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/resetPassword.schema";
import { passwordApi } from "../services/passwordApi.service";
import { AppError } from "@/shared/core/AppError";
import { useToast } from "@/shared/components/feedback";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await passwordApi.resetPassword(token, values.password);
      toast.success(
        "Mot de passe mis à jour",
        "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      );
      router.push(AUTH_ROUTES.signIn);
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message.includes("Invalid or expired")
            ? "Ce lien est invalide ou a expiré. Demandez un nouveau lien."
            : err.message
          : "Impossible de réinitialiser le mot de passe.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (!token) {
    return (
      <div className="flex w-full flex-1 flex-col lg:w-1/2">
        <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
          <Link
            href={AUTH_ROUTES.signIn}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour à la connexion
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <Alert
            variant="error"
            title="Lien invalide"
            message="Ce lien de réinitialisation est incomplet ou expiré. Demandez un nouveau lien depuis la page « Mot de passe oublié »."
          />
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href={AUTH_ROUTES.signIn}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choisissez un mot de passe sécurisé pour votre compte NEXERA.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error" title="Erreur" message={error} />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label>
              Nouveau mot de passe <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                {...register("password")}
                error={Boolean(errors.password)}
                hint={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label>
              Confirmer le mot de passe <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Répétez le mot de passe"
                autoComplete="new-password"
                {...register("confirmPassword")}
                error={Boolean(errors.confirmPassword)}
                hint={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button className="w-full" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}
