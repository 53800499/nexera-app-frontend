"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { cabinetApi } from "../services/cabinetApi.service";

export const CABINET_INVITE_CODE_QUERY_KEY = [
  "cabinet",
  "invite-code",
] as const;

export function useCabinetInviteCode(enabled = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(enabled);

  const inviteCodeQuery = useQuery({
    queryKey: CABINET_INVITE_CODE_QUERY_KEY,
    queryFn: () => cabinetApi.getInviteCode(),
    enabled: queryEnabled,
    staleTime: 1000 * 60,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => cabinetApi.regenerateInviteCode(),
    onSuccess: async (data) => {
      queryClient.setQueryData(CABINET_INVITE_CODE_QUERY_KEY, data);
    },
  });

  return { inviteCodeQuery, regenerateMutation };
}
