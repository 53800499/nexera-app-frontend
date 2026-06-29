"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  ErrorState,
  LoadingBlock,
  useToast,
} from "@/shared/components/feedback";
import { RequireCrmAccess } from "../components/RequireCrmAccess";
import { ClientEditForm } from "../components/ClientEditForm";
import { buildUpdateClientPayload } from "../schemas/clientForm.schema";
import { clientToEditValues } from "../utils/clientMappers";
import { useClient, useClients } from "../hooks/useClients";

export default function EditClientPage({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const clientQuery = useClient(id);
  const { updateMutation } = useClients();

  return (
    <RequireCrmAccess requireManage>
      <div className="space-y-4">
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la fiche
        </Link>

        {clientQuery.isLoading && (
          <LoadingBlock label="Chargement du client..." />
        )}

        {clientQuery.isError && (
          <ErrorState
            title="Client introuvable"
            message="Impossible de charger ce client pour modification."
            onRetry={() => clientQuery.refetch()}
            action={
              <Link
                href="/clients"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {clientQuery.data ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Modifier le client
              </h1>
              <p className="text-sm text-gray-500">
                {clientQuery.data.companyName} — les contacts se gèrent sur la
                fiche client.
              </p>
            </div>

            {clientQuery.data.isArchived ? (
              <ErrorState
                title="Client archivé"
                message="Un client archivé ne peut plus être modifié."
                action={
                  <Link
                    href={`/clients/${id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Voir la fiche
                  </Link>
                }
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <ClientEditForm
                  clientCode={clientQuery.data.code}
                  defaultValues={clientToEditValues(clientQuery.data)}
                  isSubmitting={updateMutation.isPending}
                  submitLabel="Enregistrer les modifications"
                  onSubmit={async (values) => {
                    try {
                      await updateMutation.mutateAsync({
                        id,
                        payload: buildUpdateClientPayload(values),
                      });
                      toast.success(
                        "Client mis à jour",
                        clientQuery.data.companyName,
                      );
                      router.push(`/clients/${id}`);
                    } catch {
                      toast.error(
                        "Modification impossible",
                        "Vérifiez les champs et réessayez.",
                      );
                    }
                  }}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </RequireCrmAccess>
  );
}
