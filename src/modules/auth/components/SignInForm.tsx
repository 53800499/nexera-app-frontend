"use client";

import Alert from "@/components/ui/alert/Alert";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AUTH_ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import {
  signInSchema,
  type SignInFormValues,
} from "../schemas/signIn.schema";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    await login(values);
  });

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href={AUTH_ROUTES.dashboard}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au tableau de bord
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Accédez à votre espace NEXERA ERP
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" title="Erreur de connexion" message={error} />
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  E-mail <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="vous@entreprise.com"
                  {...register("email")}
                  error={Boolean(errors.email)}
                  hint={errors.email?.message}
                />
              </div>

              <div>
                <Label>
                  Mot de passe <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    {...register("password")}
                    error={Boolean(errors.password)}
                    hint={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={field.value ?? false}
                        onChange={field.onChange}
                      />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Rester connecté
                      </span>
                    </div>
                  )}
                />
                <Link
                  href={AUTH_ROUTES.resetPassword}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <div>
                <Button className="w-full" size="sm" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Pas encore de compte ?{" "}
              <Link
                href={AUTH_ROUTES.signUp}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
