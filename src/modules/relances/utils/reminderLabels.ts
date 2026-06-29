import type { ReminderChannel, ReminderType } from "../types/reminder.types";

export const REMINDER_LEVEL_LABELS: Record<number, string> = {
  1: "Rappel",
  2: "Relance",
  3: "Mise en demeure",
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  auto: "Automatique",
  manual: "Manuelle",
};

export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  email: "Email",
  sms: "SMS",
  print: "Courrier",
};

export const REMINDER_LEVEL_CLASSES: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  3: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function reminderLevelLabel(level: number) {
  return REMINDER_LEVEL_LABELS[level] ?? `Niveau ${level}`;
}

export function reminderTypeLabel(type: string) {
  const key = type.toLowerCase() as ReminderType;
  return REMINDER_TYPE_LABELS[key] ?? type;
}

export function reminderChannelLabel(channel: string) {
  const key = channel.toLowerCase() as ReminderChannel;
  return REMINDER_CHANNEL_LABELS[key] ?? channel;
}
