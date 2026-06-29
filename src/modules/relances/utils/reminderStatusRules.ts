export function canSendManualReminder(status: string, amountDue: number) {
  if (amountDue <= 0) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "overdue" ||
    normalized === "partial" ||
    normalized === "sent" ||
    normalized === "issued"
  );
}
