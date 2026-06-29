"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { useToast } from "@/shared/components/feedback";
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

export default function CreateClientPage() {
  const router = useRouter();
  const toast = useToast();
  const { createMutation } = useClients();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [pendingValues, setPendingValues] = useState<ClientFormValues | null>(
    null,
  );

  const submitClient = async (
    values: ClientFormValues,
    confirmDuplicate = false,
  ) => {
    try {
      const client = await createMutation.mutateAsync(
        buildCreateClientPayload(values, confirmDuplicate),
      );
      toast.success("Client créé", client.companyName);
      router.push(`/clients/${client.id}`);
    } catch (error) {
      if (error instanceof ClientDuplicateError) {
        setDuplicates(error.duplicates);
        setPendingValues(values);
        return;
      }
      toast.error(
        "Création impossible",
        "Vérifiez les champs obligatoires et réessayez.",
      );
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
            isSubmitting={createMutation.isPending}
            onCancel={() => {
              setDuplicates(null);
              setPendingValues(null);
            }}
            onConfirm={() => submitClient(pendingValues, true)}
          />
        ) : null}

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <ClientForm
            isSubmitting={createMutation.isPending}
            submitLabel="Créer le client"
            onSubmit={(values) => submitClient(values)}
          />
        </div>
      </div>
    </RequireCrmAccess>
  );
}
