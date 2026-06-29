export function formatProfileDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatBoolean(value: boolean) {
  return value ? "Oui" : "Non";
}

export function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "—";
}
