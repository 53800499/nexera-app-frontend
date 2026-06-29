import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  PaginatedReminders,
  PaymentBehaviorSuggestion,
  ReminderProcessResult,
  ReminderSettings,
  ReminderSummary,
  SendManualReminderPayload,
  UpdateReminderSettingsPayload,
} from "../types/reminder.types";

type ListParams = {
  page: number;
  limit?: number;
  clientId?: string;
  invoiceId?: string;
};

export const remindersApi = {
  list: (params: ListParams) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.clientId) search.set("clientId", params.clientId);
    if (params.invoiceId) search.set("invoiceId", params.invoiceId);
    return authorizedFetch<PaginatedReminders>(`/reminders?${search.toString()}`);
  },

  byInvoice: (invoiceId: string) =>
    authorizedFetch<ReminderSummary[]>(`/reminders/invoices/${invoiceId}`),

  byClient: (clientId: string) =>
    authorizedFetch<ReminderSummary[]>(`/reminders/clients/${clientId}`),

  sendManual: (invoiceId: string, payload: SendManualReminderPayload) =>
    authorizedFetch<ReminderSummary>(
      `/reminders/invoices/${invoiceId}/send`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  getSettings: () =>
    authorizedFetch<ReminderSettings>("/reminders/settings"),

  updateSettings: (payload: UpdateReminderSettingsPayload) =>
    authorizedFetch<ReminderSettings>("/reminders/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  processAutomatic: () =>
    authorizedFetch<ReminderProcessResult>("/reminders/process", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  paymentBehavior: (clientId: string) =>
    authorizedFetch<PaymentBehaviorSuggestion>(
      `/reminders/clients/${clientId}/payment-behavior`,
    ),
};
