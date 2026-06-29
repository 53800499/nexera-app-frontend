import {
  REMINDER_LEVEL_CLASSES,
  reminderLevelLabel,
} from "../utils/reminderLabels";

type Props = {
  level: number;
};

export function ReminderLevelBadge({ level }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        REMINDER_LEVEL_CLASSES[level] ??
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {reminderLevelLabel(level)}
    </span>
  );
}
