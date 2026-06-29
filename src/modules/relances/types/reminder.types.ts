export type ReminderType = "auto" | "manual";

export type ReminderChannel = "email" | "sms" | "print";

export type ReminderSummary = {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  clientId: string;
  clientName?: string;
  level: number;
  type: ReminderType;
  channel: ReminderChannel;
  subject?: string | null;
  sentAt: string;
  emailTo?: string | null;
  ccEmails?: string[] | null;
  bodySnapshot?: string | null;
  createdAt: string;
};

export type PaginatedReminders = {
  items: ReminderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ReminderSettings = {
  isEnabled: boolean;
  level1DaysAfterDue: number;
  level2DaysAfterDue: number;
  level3DaysAfterDue: number;
  level2CopyCommercial: boolean;
  level3AlertDirector: boolean;
  level3BlockNewOrders: boolean;
  commercialEmail?: string | null;
  directorEmail?: string | null;
};

export type UpdateReminderSettingsPayload = Partial<ReminderSettings>;

export type SendManualReminderPayload = {
  message: string;
  channel?: ReminderChannel;
  level?: number;
  subject?: string;
};

export type ReminderProcessResult = {
  processed: number;
  sent: number;
  skipped: number;
  blocked: number;
};

export type PaymentBehaviorSuggestion = {
  avgDaysToPay: number;
  onTimePaymentRate: number;
  paidInvoicesAnalyzed: number;
  suggestions: string[];
  suggestedDelays?: Record<string, number>;
};
