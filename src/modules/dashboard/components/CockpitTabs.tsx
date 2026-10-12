"use client";

import React from "react";

export type CockpitTabKey = "overview" | "commercial" | "finance" | "operations";

interface CockpitTabsProps {
  activeTab: CockpitTabKey;
  onTabChange: (tab: CockpitTabKey) => void;
  badgeCounts?: {
    overdueInvoices?: number;
    pendingEcritures?: number;
    stockAlerts?: number;
  };
}

export function CockpitTabs({
  activeTab,
  onTabChange,
  badgeCounts,
}: CockpitTabsProps) {
  const tabs: Array<{
    id: CockpitTabKey;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: "overview",
      label: "Vue 360° Exécutive",
      description: "Synthèse générale et signaux vitaux",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "commercial",
      label: "Commercial & Ventes",
      description: "Chiffre d'affaires, devis & clients",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      badge: badgeCounts?.overdueInvoices,
      badgeColor: "bg-red-500 text-white",
    },
    {
      id: "finance",
      label: "Finance & SYSCOHADA",
      description: "Comptabilité, TVA & Réglementation",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
      badge: badgeCounts?.pendingEcritures,
      badgeColor: "bg-indigo-500 text-white",
    },
    {
      id: "operations",
      label: "Opérations, Stock & Équipe",
      description: "Niveaux de stocks, Paie RH & Frais",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      badge: badgeCounts?.stockAlerts,
      badgeColor: "bg-amber-500 text-white",
    },
  ];

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 pb-px dark:border-gray-800 custom-scrollbar">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex items-center gap-2.5 rounded-t-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "border-b-2 border-brand-500 bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-gray-200"
              }`}
            >
              <span
                className={`transition-colors ${
                  isActive
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500"
                }`}
              >
                {tab.icon}
              </span>

              <div className="text-left">
                <span className="block font-semibold leading-tight">{tab.label}</span>
                <span className="hidden text-[10px] text-gray-400 md:block">{tab.description}</span>
              </div>

              {tab.badge != null && tab.badge > 0 ? (
                <span
                  className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tab.badgeColor || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
