"use client";

import Input from "@/components/form/input/InputField";

type Props = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSubmit: () => void;
};

export function DashboardPeriodFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onSubmit,
}: Props) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="mb-1 block text-xs text-gray-500">Du</label>
        <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Au</label>
        <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        Actualiser
      </button>
    </form>
  );
}