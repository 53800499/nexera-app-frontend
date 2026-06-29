type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  default: "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
  success: "border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
  danger: "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
};

export function KpiCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
