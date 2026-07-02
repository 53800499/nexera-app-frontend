"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireCrmAccess } from "../components/RequireCrmAccess";
import {
  buildCreateClientPayload,
  ClientForm,
} from "../components/ClientForm";
import { DuplicateClientAlert } from "../components/DuplicateClientAlert";
import type { ClientFormValues } from "../schemas/clientForm.schema";
import { useClients } from "../hooks/useClients";
import { ClientDuplicateError } from "../types/client.types";
import type { DuplicateMatch } from "../types/client.types";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";

export default function CreateClientPage() {
  const { runAction, showResult, confirm, redirectWithLoader } =
    useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { createMutation } = useClients();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [pendingValues, setPendingValues] = useState<ClientFormValues | null>(
    null,
  );

  const submitClient = async (
    values: ClientFormValues,
    confirmDuplicate = false,
  ) => {
    const formatDuplicateDetails = (items: DuplicateMatch[]) =>
      items
        .map((dup) => {
          const reasons =
            dup.matchedOn.length > 0
              ? dup.matchedOn.join(", ")
              : "critères similaires";
          return `- ${dup.companyName} (${dup.code}) — ${reasons}`;
        })
        .join("\n");

    if (confirmDuplicate) {
      const client = await runAction({
        loadingMessage: "Création du client...",
        success: {
          title: "Client créé",
          message: values.companyName,
        },
        error: {
          title: "Création impossible",
          message: "Vérifiez les champs obligatoires et réessayez.",
        },
        redirectTo: (created) => `/clients/${created.id}`,
        redirectMessage: "Ouverture de la fiche client...",
        rethrowOnError: true,
        action: () =>
          createMutation.mutateAsync(
            buildCreateClientPayload(values, true),
          ),
      });

      if (client) {
        setDuplicates(null);
        setPendingValues(null);
      }
      return;
    }

    const userConfirmed = await confirm({
      title: "Créer ce client ?",
      message: `Confirmer la création de la fiche ${values.companyName}.`,
      confirmLabel: "Créer",
    });
    if (!userConfirmed) return;

    try {
      await runAction({
        loadingMessage: "Création du client...",
        showResultOnError: false,
        showResultOnSuccess: false,
        rethrowOnError: true,
        action: async () => {
          const client = await createMutation.mutateAsync(
            buildCreateClientPayload(values, false),
          );
          await showResult({
            variant: "success",
            title: "Client créé",
            message: client.companyName,
          });
          redirectWithLoader(
            `/clients/${client.id}`,
            "Ouverture de la fiche client...",
          );
          return client;
        },
      });
    } catch (error) {
      if (error instanceof ClientDuplicateError) {
        const details = formatDuplicateDetails(error.duplicates);
        const forceCreate = await confirm({
          title: "Doublon potentiel détecté",
          message:
            "Clients similaires trouvés :\n" +
            details +
            "\n\nVoulez-vous créer le client malgré tout ?",
          confirmLabel: "Créer malgré tout",
          variant: "warning",
        });
        if (forceCreate) {
          await submitClient(values, true);
        } else {
          setDuplicates(error.duplicates);
          setPendingValues(values);
        }
        return;
      }

      await showResult({
        variant: "error",
        title: "Création impossible",
        message: resolveFormErrorMessage(error),
      });
    }
  };

  return (
    <RequireCrmAccess requireManage>
      <div className="space-y-4">
        <Link
          href="/clients"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux clients
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Nouveau client
          </h1>
          <p className="text-sm text-gray-500">
            Création d&apos;une fiche client complète (UC-01).
          </p>
        </div>

        {duplicates && pendingValues ? (
          <DuplicateClientAlert
            duplicates={duplicates}
            isSubmitting={isBusy}
            onCancel={() => {
              setDuplicates(null);
              setPendingValues(null);
            }}
            onConfirm={() => void submitClient(pendingValues, true)}
          />
        ) : null}

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <ClientForm
            isSubmitting={isBusy}
            submitLabel="Créer le client"
            onSubmit={(values) => submitClient(values)}
          />
        </div>
      </div>
    </RequireCrmAccess>
  );
}
