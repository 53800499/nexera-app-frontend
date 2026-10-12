"use client";

import Link from "next/link";
import React, { useState } from "react";
import type { TopArticle, TopClient } from "../types/dashboard.types";
import { formatDashboardMoney } from "../utils/dashboardFormatters";

interface TopPerformersPanelProps {
  topClients: TopClient[];
  topArticles: TopArticle[];
  totalRevenueHt: number;
}

export function TopPerformersPanel({
  topClients,
  topArticles,
  totalRevenueHt,
}: TopPerformersPanelProps) {
  const [activeTab, setActiveTab] = useState<"clients" | "articles">("clients");

  const safeTotal = totalRevenueHt > 0 ? totalRevenueHt : 1;

  const rankBadges = [
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600",
    "bg-amber-700/10 text-amber-900 border-amber-700/30 dark:bg-amber-700/20 dark:text-amber-200 dark:border-amber-700/40",
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
      <div>
        {/* Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Classement des Meilleurs Performers
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contribution au chiffre d&apos;affaires de la période
            </p>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setActiveTab("clients")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                activeTab === "clients"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Top Clients ({topClients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("articles")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                activeTab === "articles"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Top Articles ({topArticles.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3.5">
          {activeTab === "clients" ? (
            topClients.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">
                Aucun client facturé sur la période sélectionnée.
              </p>
            ) : (
              topClients.map((client, index) => {
                const sharePercent = (client.revenueHt / safeTotal) * 100;
                return (
                  <div key={client.clientId} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                            rankBadges[index] || rankBadges[3]
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <Link
                            href={`/clients/${client.clientId}`}
                            className="text-xs font-bold text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                          >
                            {client.clientName}
                          </Link>
                          <span className="ml-2 text-[10px] text-gray-400">
                            {client.invoiceCount} facture(s)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {formatDashboardMoney(client.revenueHt)}
                        </span>
                        <span className="ml-2 text-[10px] text-gray-400">
                          ({sharePercent.toFixed(1)} %)
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${Math.min(sharePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )
          ) : topArticles.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">
              Aucun article vendu sur la période sélectionnée.
            </p>
          ) : (
            topArticles.map((article, index) => {
              const sharePercent = (article.revenueHt / safeTotal) * 100;
              return (
                <div
                  key={article.itemId ?? `${article.label}-${index}`}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                          rankBadges[index] || rankBadges[3]
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        {article.itemId ? (
                          <Link
                            href={`/catalogue/${article.itemId}`}
                            className="text-xs font-bold text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                          >
                            {article.label}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {article.label}
                          </span>
                        )}
                        <span className="ml-2 text-[10px] text-gray-400">
                          Qté : {article.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {formatDashboardMoney(article.revenueHt)}
                      </span>
                      <span className="ml-2 text-[10px] text-gray-400">
                        ({sharePercent.toFixed(1)} %)
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.min(sharePercent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 text-center dark:border-gray-800">
        <Link
          href="/rapports"
          className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Consulter l&apos;analyse complète des ventes et marges →
        </Link>
      </div>
    </div>
  );
}
