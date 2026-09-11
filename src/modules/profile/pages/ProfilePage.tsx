"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth";
import { TenantOrganizationSummary } from "@/modules/parametres/components/TenantOrganizationSummary";
import { useTenantSettings } from "@/modules/parametres/hooks/useSettings";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { ProfileAccountSummary } from "../components/ProfileAccountSummary";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { ProfileMetaCard } from "../components/ProfileMetaCard";
import { useProfile } from "../hooks/useProfile";
import {
  canManageTenantSettingsFromProfile,
  canReadTenantSettingsFromProfile,
} from "../utils/profileAccess";

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { profileQuery, updateProfileMutation, changePasswordMutation } =
    useProfile(isAuthenticated);

  const profile = profileQuery.data;
  const canReadSettings = profile
    ? canReadTenantSettingsFromProfile(profile.permissions)
    : false;
  const canManageSettings = profile
    ? canManageTenantSettingsFromProfile(profile.permissions)
    : false;

  const { tenantQuery } = useTenantSettings(
    isAuthenticated && canReadSettings,
  );

  if (!isAuthenticated) {
    return (
      <ErrorState
        title="Connexion requise"
        message="Connectez-vous pour accéder à votre profil."
        action={
          <Link
            href="/signin"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Se connecter
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Mon profil
        </h1>
        <p className="text-sm text-gray-500">
          Gérez vos informations personnelles et consultez votre organisation.
        </p>
      </div>

      {profileQuery.isPending && !profile ? (
        <LoadingBlock label="Chargement du profil..." />
      ) : null}

      {profileQuery.isError ? (
        <ErrorState
          title="Échec du chargement"
          message="Impossible de charger le profil."
          onRetry={() => profileQuery.refetch()}
        />
      ) : null}

      {profile ? (
        <>
          <ProfileMetaCard profile={profile} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ProfileInfoForm
              defaultValues={{
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
              }}
              isSubmitting={updateProfileMutation.isPending}
              onSubmit={async (values) => {
                await updateProfileMutation.mutateAsync(values);
              }}
            />

            <ChangePasswordForm
              isSubmitting={changePasswordMutation.isPending}
              onSubmit={async (values) => {
                await changePasswordMutation.mutateAsync({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
              }}
            />
          </div>

          <ProfileAccountSummary profile={profile} />

          {profile.tenant.type === "cabinet" ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                      {profile.cabinet?.raisonSociale || profile.tenant.name}
                    </h3>
                    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      Cabinet d&apos;Expertise Comptable
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Organisation professionnelle comptable de rattachement
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/parametres/entreprise"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
                  >
                    Gérer la fiche cabinet
                  </Link>
                  <Link
                    href="/parametres/cabinet"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Code d&apos;invitation cabinet
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <span className="block text-xs font-medium text-gray-500">Raison sociale</span>
                  <span className="mt-0.5 block font-medium text-gray-800 dark:text-white/90">
                    {profile.cabinet?.raisonSociale || profile.tenant.name}
                  </span>
                </div>
                {profile.cabinet?.numeroInscriptionOrdre ? (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">N° Ordre des Experts-Comptables</span>
                    <span className="mt-0.5 block font-semibold text-gray-800 dark:text-white/90">
                      {profile.cabinet.numeroInscriptionOrdre}
                    </span>
                  </div>
                ) : null}
                {profile.cabinet?.emailContact || profile.tenant.companyEmail ? (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">Email cabinet</span>
                    <span className="mt-0.5 block text-gray-800 dark:text-white/90">
                      {profile.cabinet?.emailContact || profile.tenant.companyEmail}
                    </span>
                  </div>
                ) : null}
                {profile.cabinet?.telephone ? (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">Téléphone</span>
                    <span className="mt-0.5 block text-gray-800 dark:text-white/90">
                      {profile.cabinet.telephone}
                    </span>
                  </div>
                ) : null}
                {profile.cabinet?.adresse ? (
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-medium text-gray-500">Adresse professionnelle</span>
                    <span className="mt-0.5 block text-gray-800 dark:text-white/90">
                      {profile.cabinet.adresse}
                    </span>
                  </div>
                ) : null}
                {profile.collaborateur ? (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">Rôle au sein du cabinet</span>
                    <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {profile.collaborateur.role?.libelle || profile.collaborateur.role?.code || "Collaborateur"}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <TenantOrganizationSummary
                variant={canReadSettings ? "full" : "basic"}
                tenantName={profile.tenant.name}
                tenantType={profile.tenant.type}
                settings={canReadSettings ? tenantQuery.data : null}
                profileFallback={{
                  legalName: profile.tenant.legalName,
                  tradeName: profile.tenant.tradeName,
                  primaryCurrency: profile.tenant.primaryCurrency,
                  companyEmail: profile.tenant.companyEmail,
                }}
                canManage={canManageSettings}
                isLoadingSettings={canReadSettings && tenantQuery.isPending}
              />

              {canManageSettings ? (
                <p className="text-xs text-gray-400">
                  Pour modifier les informations légales, utilisez{" "}
                  <Link
                    href="/parametres/entreprise"
                    className="text-brand-500 hover:underline"
                  >
                    Paramètres → Entreprise
                  </Link>
                  .
                </p>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
