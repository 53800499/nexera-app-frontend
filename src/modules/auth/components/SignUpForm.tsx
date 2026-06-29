"use client";

import Alert from "@/components/ui/alert/Alert";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Radio from "@/components/form/input/Radio";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { NexeraLogo } from "@/components/brand/NexeraLogo";
import { useSignupWorkspace } from "../context/SignupWorkspaceContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AUTH_ROUTES } from "../constants/routes";
import { WORKSPACE_LABELS } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";
import {
  signUpSchema,
  type SignUpFormValues,
} from "../schemas/signUp.schema";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      tenantType: "company",
      tenantName: "",
      acceptTerms: false,
    },
  });

  const tenantType = watch("tenantType");
  const isCabinet = tenantType === "cabinet";
  const signupWorkspace = useSignupWorkspace();

  useEffect(() => {
    signupWorkspace?.setWorkspace(isCabinet ? "cabinet" : "entreprise");
  }, [isCabinet, signupWorkspace]);

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    await registerUser({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      tenantName: values.tenantName,
      tenantType: values.tenantType,
    });
  });

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href={AUTH_ROUTES.signIn}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6 lg:hidden">
          <NexeraLogo
            workspace={isCabinet ? "cabinet" : "entreprise"}
            showContext
          />
        </div>
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Créer un compte
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isCabinet
                ? "Inscrivez votre cabinet comptable sur NEXERA"
                : "Inscrivez votre entreprise sur NEXERA ERP"}
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" title="Erreur d'inscription" message={error} />
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Type d&apos;organisation <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="tenantType"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-6">
                      <Radio
                        id="tenant-company"
                        name="tenantType"
                        value="company"
                        checked={field.value === "company"}
                        onChange={field.onChange}
                        label={WORKSPACE_LABELS.entreprise}
                      />
                      <Radio
                        id="tenant-cabinet"
                        name="tenantType"
                        value="cabinet"
                        checked={field.value === "cabinet"}
                        onChange={field.onChange}
                        label={WORKSPACE_LABELS.cabinet}
                      />
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Prénom <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Prénom"
                    {...register("firstName")}
                    error={Boolean(errors.firstName)}
                    hint={errors.firstName?.message}
                  />
                </div>
                <div>
                  <Label>
                    Nom <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nom"
                    {...register("lastName")}
                    error={Boolean(errors.lastName)}
                    hint={errors.lastName?.message}
                  />
                </div>
              </div>

              <div>
                <Label>
                  {isCabinet ? "Nom du cabinet" : "Nom de l'entreprise"}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder={isCabinet ? "Cabinet Dupont & Associés" : "Raison sociale"}
                  {...register("tenantName")}
                  error={Boolean(errors.tenantName)}
                  hint={errors.tenantName?.message}
                />
              </div>

              <div>
                <Label>
                  E-mail <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder={isCabinet ? "vous@cabinet.com" : "vous@entreprise.com"}
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
                    placeholder="Minimum 8 caractères"
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

              <Controller
                name="acceptTerms"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="w-5 h-5 mt-0.5"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <p className="font-normal text-gray-500 dark:text-gray-400 text-sm">
                      J&apos;accepte les conditions générales et la politique
                      de confidentialité de NEXERA.
                    </p>
                  </div>
                )}
              />
              {errors.acceptTerms && (
                <p className="text-xs text-error-500">
                  {errors.acceptTerms.message}
                </p>
              )}

              <div>
                <Button className="w-full" size="sm" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Déjà un compte ?{" "}
              <Link
                href={AUTH_ROUTES.signIn}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
