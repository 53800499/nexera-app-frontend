"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { remindersApi } from "../services/remindersApi.service";
import type {
  SendManualReminderPayload,
  UpdateReminderSettingsPayload,
} from "../types/reminder.types";

export const REMINDERS_QUERY_KEY = ["reminders"] as const;
export const REMINDER_SETTINGS_QUERY_KEY = ["reminders", "settings"] as const;

type ListParams = {
  page?: number;
  limit?: number;
  clientId?: string;
  invoiceId?: string;
};

export function useReminders(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const { page = 1, limit = 20, clientId, invoiceId } = params;

  const remindersQuery = useQuery({
    queryKey: [
      ...REMINDERS_QUERY_KEY,
      page,
      limit,
      clientId ?? "",
      invoiceId ?? "",
    ],
    queryFn: () =>
      remindersApi.list({
        page,
        limit,
        clientId,
        invoiceId,
      }),
    enabled: queryEnabled,
  });

  const sendManualMutation = useMutation({
    mutationFn: ({
      invoiceId: targetInvoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: SendManualReminderPayload;
    }) => remindersApi.sendManual(targetInvoiceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });

  const processMutation = useMutation({
    mutationFn: () => remindersApi.processAutomatic(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });

  return {
    remindersQuery,
    sendManualMutation,
    processMutation,
  };
}

export function useReminderSettings() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const settingsQuery = useQuery({
    queryKey: REMINDER_SETTINGS_QUERY_KEY,
    queryFn: () => remindersApi.getSettings(),
    enabled: queryEnabled,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: UpdateReminderSettingsPayload) =>
      remindersApi.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_SETTINGS_QUERY_KEY });
    },
  });

  return {
    settingsQuery,
    updateSettingsMutation,
  };
}

export function useInvoiceReminders(invoiceId: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["reminders", "invoice", invoiceId],
    queryFn: () => remindersApi.byInvoice(invoiceId),
    enabled: queryEnabled && Boolean(invoiceId),
  });
}

export function useClientPaymentBehavior(clientId: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["reminders", "behavior", clientId],
    queryFn: () => remindersApi.paymentBehavior(clientId),
    enabled: queryEnabled && Boolean(clientId),
  });
}
