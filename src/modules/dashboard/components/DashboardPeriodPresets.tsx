"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import { formatDashboardDate } from "../utils/dashboardFormatters";

export interface PeriodRange {
  from: string;
  to: string;
}

interface DashboardPeriodPresetsProps {
  currentFrom: string;
  currentTo: string;
  onApply: (range: PeriodRange) => void;
}

type PresetKey = "current_month" | "previous_month" | "current_quarter" | "year_to_date" | "custom";

export function DashboardPeriodPresets({
  currentFrom,
  currentTo,
  onApply,
}: DashboardPeriodPresetsProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>("current_month");
  const [customFrom, setCustomFrom] = useState(currentFrom);
  const [customTo, setCustomTo] = useState(currentTo);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const calculatePreset = (key: PresetKey): PeriodRange | null => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed

    const toIso = (d: Date) => d.toISOString().slice(0, 10);

    if (key === "current_month") {
      const start = new Date(y, m, 1);
      return { from: toIso(start), to: toIso(now) };
    }
    if (key === "previous_month") {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0); // last day of prev month
      return { from: toIso(start), to: toIso(end) };
    }
    if (key === "current_quarter") {
      const quarterStartMonth = Math.floor(m / 3) * 3;
      const start = new Date(y, quarterStartMonth, 1);
      return { from: toIso(start), to: toIso(now) };
    }
    if (key === "year_to_date") {
      const start = new Date(y, 0, 1);
      return { from: toIso(start), to: toIso(now) };
    }
    return null;
  };

  const handleSelectPreset = (key: PresetKey) => {
    setActivePreset(key);
    if (key === "custom") {
      setShowCustomPicker(true);
      return;
    }
    setShowCustomPicker(false);
    const range = calculatePreset(key);
    if (range) {
      setCustomFrom(range.from);
      setCustomTo(range.to);
      onApply(range);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      setActivePreset("custom");
      onApply({ from: customFrom, to: customTo });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Preset pill buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Période :
          </span>

          <button
            type="button"
            onClick={() => handleSelectPreset("current_month")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activePreset === "current_month"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Mois en cours
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("previous_month")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activePreset === "previous_month"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Mois précédent
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("current_quarter")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activePreset === "current_quarter"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Trimestre en cours
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("year_to_date")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activePreset === "year_to_date"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Année en cours
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset("custom")}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activePreset === "custom"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Personnalisé</span>
          </button>
        </div>

        {/* Current range indicator badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
          <span>
            Du <strong className="text-gray-700 dark:text-gray-200">{formatDashboardDate(currentFrom)}</strong> au{" "}
            <strong className="text-gray-700 dark:text-gray-200">{formatDashboardDate(currentTo)}</strong>
          </span>
          <span className="hidden text-xs text-gray-400 sm:inline">(comparé à N-1)</span>
        </div>
      </div>

      {/* Custom date range collapsible row */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustom}
          className="mt-3 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800"
        >
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Date début</label>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Date fin</label>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-xs"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Appliquer l&apos;intervalle
          </button>

          <button
            type="button"
            onClick={() => setShowCustomPicker(false)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Fermer
          </button>
        </form>
      )}
    </div>
  );
}
