"use client";

import { useState } from "react";
import { DuplicateClientAlert } from "../components/DuplicateClientAlert";
import type { DuplicateMatch } from "../types/client.types";
import { useCheckDuplicates } from "../hooks/useCheckDuplicates";
import { useActionFeedback } from "@/shared/components/feedback";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";

type Props = {
  siret?: string;
  taxId?: string;
  email?: string;
  companyName?: string;
};

export function ClientDuplicateChecker({
  siret,
  taxId,
  email,
  companyName,
}: Props) {
  const { runAction, showResult } = useActionFeedback();
  const checkDuplicates = useCheckDuplicates();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [checked, setChecked] = useState(false);

  const formatDuplicateDetails = (items: DuplicateMatch[]) =>
    items
      .map((dup) => {
        const reasons =
          dup.matchedOn.length > 0 ? dup.matchedOn.join(", ") : "critères similaires";
        return `- ${dup.companyName} (${dup.code}) — ${reasons}`;
      })
      .join("\n");

  const runCheck = async () => {
    const hasCriteria =
      siret?.trim() ||
      taxId?.trim() ||
      email?.trim() ||
      companyName?.trim();

    if (!hasCriteria) {
      setDuplicates(null);
      setChecked(false);
      return;
    }

    let foundDuplicates: DuplicateMatch[] = [];
    try {
      await runAction({
        loadingMessage: "Vérification des doublons...",
        showResultOnSuccess: false,
        showResultOnError: false,
        action: async () => {
          const result = await checkDuplicates.mutateAsync({
            siret: siret?.trim() || undefined,
            taxId: taxId?.trim() || undefined,
            email: email?.trim() || undefined,
            companyName: companyName?.trim() || undefined,
          });
          setChecked(true);
          setDuplicates(result.hasDuplicates ? result.duplicates : null);
          foundDuplicates = result.hasDuplicates ? result.duplicates : [];
          return result;
        },
      });
    } catch (error) {
      await showResult({
        variant: "error",
        title: "Vérification impossible",
        message: resolveFormErrorMessage(error),
      });
      return;
    }

    if (foundDuplicates.length > 0) {
      await showResult({
        variant: "error",
        title: "Doublons potentiels détectés",
        message:
          "Clients similaires trouvés :\n" +
          formatDuplicateDetails(foundDuplicates) +
          "\n\nVous pouvez poursuivre la création après vérification.",
      });
    }
  };

  if (!checked && !duplicates) {
    return (
      <button
        type="button"
        onClick={() => void runCheck()}
        className="text-sm font-medium text-brand-500 hover:text-brand-600 mr-6"
      >
        Vérifier les doublons potentiels
      </button>
    );
  }

  if (!duplicates?.length) {
    return (
      <p className="text-sm text-success-600 dark:text-success-400">
        Aucun doublon détecté pour les critères saisis.
      </p>
    );
  }

  return (
    <DuplicateClientAlert
      duplicates={duplicates}
      mode="check"
      onCancel={() => {
        setDuplicates(null);
        setChecked(false);
      }}
      onConfirm={() => setDuplicates(null)}
    />
  );
}
