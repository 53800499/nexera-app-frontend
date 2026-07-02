"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  buildCreateUserPayload,
  UserForm,
} from "../components/UserForm";
import { RequireUserAccess } from "../components/RequireUserAccess";
import type { CreateUserFormValues } from "../schemas/userForm.schema";
import { useUsers } from "../hooks/useUsers";

export default function CreateUserPage() {
  const router = useRouter();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { rolesQuery, createMutation } = useUsers();

  const submit = async (values: CreateUserFormValues) => {
    await runAction({
      confirm: {
        title: "Créer cet utilisateur ?",
        message:
          "Un compte sera créé et un e-mail d'invitation sera envoyé si aucun mot de passe n'est défini.",
        confirmLabel: "Créer",
      },
      loadingMessage: "Création de l'utilisateur...",
      success: {
        title: "Utilisateur créé",
        message: `${values.firstName} ${values.lastName} a été ajouté.`,
      },
      redirectTo: (user) => `/utilisateurs/${user.id}`,
      redirectMessage: "Ouverture de la fiche utilisateur...",
      error: {
        title: "Création impossible",
        message:
          "Vérifiez l'e-mail, le mot de passe (8 caractères min.) et les rôles sélectionnés.",
      },
      showResultOnError: false,
      rethrowOnError: true,
      action: () =>
        createMutation.mutateAsync(buildCreateUserPayload(values)),
    });
  };

  return (
    <RequireUserAccess requireManage>
      <div className="space-y-6">
        <Link
          href="/utilisateurs"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouvel utilisateur
          </h1>
          <p className="text-sm text-gray-500">
            Créez un compte et assignez ses rôles. Un email d&apos;invitation sera
            envoyé automatiquement.
          </p>
        </div>

        {rolesQuery.isPending && !rolesQuery.data ? (
          <LoadingBlock label="Chargement des rôles..." />
        ) : null}

        {rolesQuery.isError ? (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger les rôles disponibles. Vérifiez votre connexion puis réessayez."
            onRetry={() => rolesQuery.refetch()}
          />
        ) : null}

        {rolesQuery.data ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
            <UserForm
              mode="create"
              formKey="create"
              roles={rolesQuery.data}
              isSubmitting={createMutation.isPending || isBusy}
              submitLabel="Créer l'utilisateur"
              onCancel={() => router.push("/utilisateurs")}
              onSubmit={submit}
            />
          </div>
        ) : null}
      </div>
    </RequireUserAccess>
  );
}
