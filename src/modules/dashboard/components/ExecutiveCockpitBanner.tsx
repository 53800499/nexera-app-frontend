"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

interface ExecutiveCockpitBannerProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ExecutiveCockpitBanner({
  onRefresh,
  isRefreshing = false,
}: ExecutiveCockpitBannerProps) {
  const user = useAuthUser();
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const handleRefresh = () => {
    setLastRefreshedAt(new Date());
    onRefresh?.();
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Dirigeant";

  const todayStr = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const timeStr = lastRefreshedAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-800/40 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-6 text-white shadow-xl shadow-brand-950/20">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Salutation & live badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              e-MECeF DGI Bénin Connecté
            </span>

            <span className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              SYSCOHADA AUDCIF 2017
            </span>

            <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              XOF (FCFA)
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Cockpit de Pilotage Général NEXERA
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Bienvenue, <span className="font-semibold text-brand-200">{displayName}</span> •{" "}
              <span className="capitalize">{todayStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg
              className="h-3.5 w-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Dernière synchronisation des indicateurs à {timeStr}</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-brand-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Rafraîchir les données"
            >
              <svg
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isRefreshing ? "Actualisation..." : "Actualiser"}</span>
            </button>
          </div>
        </div>

        {/* Right: Quick actions bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-400 hover:shadow-brand-500/40 active:scale-95"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Nouvelle Facture</span>
          </Link>

          <Link
            href="/encaissements/nouveau"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <svg
              className="h-4 w-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Encaisser</span>
          </Link>

          <Link
            href="/comptabilite/ecritures"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <svg
              className="h-4 w-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Journal Compta</span>
          </Link>

          <Link
            href="/stock/mouvements/nouvelle-entree"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <svg
              className="h-4 w-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span>Entrée Stock</span>
          </Link>

          <Link
            href="/rapports"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
            title="Consulter les rapports détaillés"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Rapports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
