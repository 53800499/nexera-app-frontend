"use client";

import { useEffect, useRef } from "react";
import type { DefaultValues, FieldValues, UseFormReset } from "react-hook-form";

export function buildFormHydrationKey(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Réinitialise le formulaire uniquement quand la source de données change
 * (ex. autre entité, nouveaux paramètres serveur), pas à chaque re-render
 * ni après une erreur de soumission.
 */
export function useHydrateFormDefaults<T extends FieldValues>(
  reset: UseFormReset<T>,
  values: DefaultValues<T>,
  hydrationKey: string,
) {
  const lastHydrationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastHydrationKeyRef.current === hydrationKey) return;
    lastHydrationKeyRef.current = hydrationKey;
    reset(values);
  }, [hydrationKey, reset, values]);
}
