export function formatUserDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getUserFullName(user: {
  firstName: string;
  lastName: string;
}) {
  return `${user.firstName} ${user.lastName}`.trim();
}
