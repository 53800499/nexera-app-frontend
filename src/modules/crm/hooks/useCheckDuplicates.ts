"use client";

import { useMutation } from "@tanstack/react-query";
import { clientsOfflineService } from "../offline/services/clientsOffline.service";

export function useCheckDuplicates() {
  return useMutation({
    networkMode: "always",
    mutationFn: clientsOfflineService.checkDuplicates,
  });
}
