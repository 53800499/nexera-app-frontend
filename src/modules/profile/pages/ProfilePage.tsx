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
      ) : null}
    </div>
  );
}
