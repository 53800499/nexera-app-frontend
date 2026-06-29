type Props = {
  isCancelled: boolean;
};

export function PaymentStatusBadge({ isCancelled }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isCancelled
          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          : "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
      }`}
    >
      {isCancelled ? "Annulé" : "Actif"}
    </span>
  );
}
