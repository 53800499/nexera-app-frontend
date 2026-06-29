"use client";

import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import type { DuplicateMatch } from "../types/client.types";

type Props = {
  duplicates: DuplicateMatch[];
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "check";
};

export function DuplicateClientAlert({
  duplicates,
  onConfirm,
  onCancel,
  isSubmitting,
  mode = "create",
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/10">
      <Alert
        variant="warning"
        title="Doublon potentiel détecté"
        message="Un ou plusieurs clients similaires existent déjà (SIRET, IFU, e-mail ou raison sociale)."
      />
      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {duplicates.map((dup) => (
          <li
            key={dup.id}
            className="rounded-lg border border-warning-200 bg-white px-3 py-2 dark:border-warning-500/20 dark:bg-gray-900"
          >
            <span className="font-medium">{dup.companyName}</span>
            <span className="ml-2 text-xs text-gray-500">({dup.code})</span>
            <span className="mt-1 block text-xs text-gray-500">
              Correspondance : {dup.matchedOn.join(", ")}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {mode === "create" ? (
          <>
            <Button size="sm" disabled={isSubmitting} onClick={onConfirm}>
              Créer malgré tout
            </Button>
            <Button
              size="sm"
              className="bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
              onClick={onCancel}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onCancel}>
            J&apos;ai compris
          </Button>
        )}
      </div>
    </div>
  );
}
