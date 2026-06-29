type Props = {
  isArchived: boolean;
};

export function ClientStatusBadge({ isArchived }: Props) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isArchived
          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          : "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
      }`}
    >
      {isArchived ? "Archivé" : "Actif"}
    </span>
  );
}
