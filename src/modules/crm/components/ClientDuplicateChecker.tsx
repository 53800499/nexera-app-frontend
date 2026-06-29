"use client";

import { useState } from "react";
import { DuplicateClientAlert } from "../components/DuplicateClientAlert";
import type { DuplicateMatch } from "../types/client.types";
import { useCheckDuplicates } from "../hooks/useCheckDuplicates";

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
  const checkDuplicates = useCheckDuplicates();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [checked, setChecked] = useState(false);

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

    try {
      const result = await checkDuplicates.mutateAsync({
        siret: siret?.trim() || undefined,
        taxId: taxId?.trim() || undefined,
        email: email?.trim() || undefined,
        companyName: companyName?.trim() || undefined,
      });
      setChecked(true);
      setDuplicates(result.hasDuplicates ? result.duplicates : null);
    } catch {
      setDuplicates(null);
    }
  };

  if (!checked && !duplicates) {
    return (
      <button
        type="button"
        onClick={runCheck}
        disabled={checkDuplicates.isPending}
        className="text-sm font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50"
      >
        {checkDuplicates.isPending
          ? "Vérification des doublons..."
          : "Vérifier les doublons potentiels"}
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
