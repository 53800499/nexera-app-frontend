"use client";

import Link from "next/link";
import React from "react";

export type KpiTrend = {
  value: string;
  isPositive: boolean | null;
  comparisonText?: string;
};

export type KpiTheme = "primary" | "emerald" | "amber" | "rose" | "indigo" | "purple" | "cyan" | "teal";

interface ExecutiveKpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: KpiTrend;
  theme?: KpiTheme;
  href?: string;
  badge?: {
    text: string;
    variant: "success" | "danger" | "warning" | "info" | "neutral";
  };
  progress?: {
    percent: number;
    label?: string;
  };
}

const themeStyles: Record<
  KpiTheme,
  {
    iconBg: string;
    iconColor: string;
    borderHover: string;
    glow: string;
  }
> = {
  primary: {
    iconBg: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
    iconColor: "text-brand-600 dark:text-brand-400",
    borderHover: "hover:border-brand-300 dark:hover:border-brand-700",
    glow: "group-hover:shadow-brand-500/10",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    glow: "group-hover:shadow-emerald-500/10",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
    glow: "group-hover:shadow-amber-500/10",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-700",
    glow: "group-hover:shadow-rose-500/10",
  },
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-700",
    glow: "group-hover:shadow-indigo-500/10",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-700",
    glow: "group-hover:shadow-purple-500/10",
  },
  cyan: {
    iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderHover: "hover:border-cyan-300 dark:hover:border-cyan-700",
    glow: "group-hover:shadow-cyan-500/10",
  },
  teal: {
    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-700",
    glow: "group-hover:shadow-teal-500/10",
  },
};

const badgeStyles = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  info: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30",
  neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export function ExecutiveKpiCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  theme = "primary",
  href,
  badge,
  progress,
}: ExecutiveKpiCardProps) {
  const currentTheme = themeStyles[theme];

  const content = (
    <div
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-900/80 ${currentTheme.borderHover} ${currentTheme.glow}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {value}
            </h3>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${currentTheme.iconBg}`}
        >
          {icon}
        </div>
      </div>

      {/* Middle Badges / Subtitle */}
      <div className="mt-3 space-y-2">
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}

        {/* Progress Bar (Optional) */}
        {progress != null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{progress.label || "Progression"}</span>
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {Math.round(progress.percent)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  theme === "rose"
                    ? "bg-rose-500"
                    : theme === "emerald"
                    ? "bg-emerald-500"
                    : theme === "amber"
                    ? "bg-amber-500"
                    : "bg-brand-500"
                }`}
                style={{ width: `${Math.min(Math.max(progress.percent, 0), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800/80">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${
                trend.isPositive === true
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : trend.isPositive === false
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {trend.isPositive === true && (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend.isPositive === false && (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend.value}
            </span>
            {trend.comparisonText && (
              <span className="text-[11px] text-gray-400">{trend.comparisonText}</span>
            )}
          </div>
        ) : badge ? (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
              badgeStyles[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">Indicateur temps réel</span>
        )}

        {href && (
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 opacity-80 transition-opacity group-hover:opacity-100 dark:text-brand-400">
            Détail
            <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
