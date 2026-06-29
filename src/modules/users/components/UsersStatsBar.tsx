"use client";

type Props = {
  total: number;
  active: number;
  inactive: number;
};

export function UsersStatsBar({ total, active, inactive }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500">Total</p>
        <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {total}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500">Actifs</p>
        <p className="mt-1 text-2xl font-semibold text-success-600">{active}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500">Inactifs</p>
        <p className="mt-1 text-2xl font-semibold text-amber-600">{inactive}</p>
      </div>
    </div>
  );
}
