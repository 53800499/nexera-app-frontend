"use client";

import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "../constants/routes";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgotPassword.schema";
import { passwordApi } from "../services/passwordApi.service";
import { AppError } from "@/shared/core/AppError";

const SUCCESS_MESSAGE =
  "Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé.";

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await passwordApi.forgotPassword(values.email);
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : "Impossible d'envoyer la demande. Réessayez plus tard.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

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
            Mot de passe oublié
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saisissez votre e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {isSuccess ? (
          <Alert
            variant="success"
            title="Demande envoyée"
            message={SUCCESS_MESSAGE}
          />
        ) : (
          <>
            {error && (
              <div className="mb-4">
                <Alert variant="error" title="Erreur" message={error} />
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <Label>
                  E-mail <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  {...register("email")}
                  error={Boolean(errors.email)}
                  hint={errors.email?.message}
                />
              </div>

              <Button className="w-full" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-gray-700 dark:text-gray-400 sm:text-start">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            href={AUTH_ROUTES.signIn}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
