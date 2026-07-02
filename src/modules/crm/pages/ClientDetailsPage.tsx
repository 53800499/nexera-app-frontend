"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  useActionFeedback,
} from "@/shared/components/feedback";
import { RequireCrmAccess } from "../components/RequireCrmAccess";
import { ClientContactsSection } from "../components/ClientContactsSection";
import { ClientDetailsCard } from "../components/ClientDetailsCard";
import { ClientHistoryTabs } from "../components/ClientHistoryTabs";
import { useCrmAccess } from "../hooks/useCrmAccess";
import { useClient, useClients } from "../hooks/useClients";

export default function ClientDetailsPage({ id }: { id: string }) {
  const { runAction } = useActionFeedback();
  const { canManageClients } = useCrmAccess();
  const clientQuery = useClient(id);
  const { archiveMutation, unarchiveMutation } = useClients();

  return (
    <RequireCrmAccess>
      <div className="space-y-4">
        <Link
          href="/clients"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour aux clients
        </Link>

        {clientQuery.isPending && !clientQuery.data && (
          <LoadingBlock label="Chargement de la fiche client..." />
        )}

        {clientQuery.isError && (
          <ErrorState
            title="Client introuvable"
            message="Impossible de charger cette fiche client."
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

        {!clientQuery.isPending && !clientQuery.isError && !clientQuery.data && (
          <EmptyState
            title="Client introuvable"
            description="Ce client n'existe pas ou a été archivé."
            action={
              <Link
                href="/clients"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Retour à la liste
              </Link>
            }
          />
        )}

        {clientQuery.data ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  Fiche client
                </h1>
                <p className="text-sm text-gray-500">
                  Historique des transactions et gestion des contacts.
                </p>
              </div>
              {canManageClients ? (
                <div className="flex flex-wrap gap-2">
                  {!clientQuery.data.isArchived ? (
                    <>
                      <Link
                        href={`/clients/${clientQuery.data.id}/modifier`}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-500/40"
                        onClick={() =>
                          void runAction({
                            confirm: {
                              title: "Archiver ce client ?",
                              message:
                                "Il restera visible dans l'historique des transactions mais ne pourra plus être modifié.",
                              confirmLabel: "Archiver",
                              variant: "warning",
                            },
                            loadingMessage: "Archivage du client...",
                            success: {
                              title: "Client archivé",
                              message: clientQuery.data.companyName,
                            },
                            error: {
                              title: "Impossible d'archiver le client",
                            },
                            action: async () => {
                              await archiveMutation.mutateAsync(clientQuery.data.id);
                              await clientQuery.refetch();
                            },
                          })
                        }
                      >
                        Archiver
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg border border-success-300 px-4 py-2 text-sm font-medium text-success-600 hover:bg-success-50 dark:border-success-500/40"
                      onClick={() =>
                        void runAction({
                          confirm: {
                            title: "Désarchiver ce client ?",
                            message:
                              "Le client redeviendra actif et à nouveau modifiable.",
                            confirmLabel: "Désarchiver",
                          },
                          loadingMessage: "Désarchivage du client...",
                          success: {
                            title: "Client désarchivé",
                            message: clientQuery.data.companyName,
                          },
                          error: {
                            title: "Impossible de désarchiver le client",
                          },
                          action: async () => {
                            await unarchiveMutation.mutateAsync(clientQuery.data.id);
                            await clientQuery.refetch();
                          },
                        })
                      }
                    >
                      Désarchiver
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <ClientDetailsCard client={clientQuery.data} />
            <ClientContactsSection
              clientId={clientQuery.data.id}
              contacts={clientQuery.data.contacts}
              canManage={canManageClients}
            />
            <ClientHistoryTabs client={clientQuery.data} />
          </>
        ) : null}
      </div>
    </RequireCrmAccess>
  );
}
