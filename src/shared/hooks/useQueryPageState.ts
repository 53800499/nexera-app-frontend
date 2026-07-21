"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQueryEnabled } from "./useQueryEnabled";

/** Évite le flash « Échec du chargement » avant bootstrap session ou pendant un refetch. */
export function useQueryPageState<T>(query: UseQueryResult<T, Error>) {
  const queryEnabled = useQueryEnabled();

  const hasData = query.data !== undefined;

  const showLoading =
    !queryEnabled || ((query.isPending || query.isFetching) && !hasData);

  const showError =
    queryEnabled && query.isError && !query.isFetching && !hasData;

  return { showLoading, showError, queryEnabled };
}
