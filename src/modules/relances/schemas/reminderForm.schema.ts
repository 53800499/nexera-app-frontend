import { z } from "zod";

export const manualReminderSchema = z.object({
  message: z.string().trim().min(1, "Message obligatoire"),
  subject: z.string().optional(),
  channel: z.enum(["email", "sms", "print"]),
  level: z.number().min(1).max(3).optional(),
});

export type ManualReminderFormValues = z.infer<typeof manualReminderSchema>;

export const reminderSettingsSchema = z.object({
  isEnabled: z.boolean(),
  level1DaysAfterDue: z.number().min(0),
  level2DaysAfterDue: z.number().min(0),
  level3DaysAfterDue: z.number().min(0),
  level2CopyCommercial: z.boolean(),
  level3AlertDirector: z.boolean(),
  level3BlockNewOrders: z.boolean(),
  commercialEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  directorEmail: z.string().email("Email invalide").optional().or(z.literal("")),
});

export type ReminderSettingsFormValues = z.infer<typeof reminderSettingsSchema>;
