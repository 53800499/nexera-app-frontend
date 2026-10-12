"use client";

import Link from "next/link";
import React from "react";

interface ModuleCardItem {
  id: string;
  name: string;
  category: string;
  description: string;
  href: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  tag: string;
}

export function ModuleEcosystemGrid() {
  const modules: ModuleCardItem[] = [
    {
      id: "factures",
      name: "Facturation & Devis",
      category: "Ventes & Clients",
      description: "Devis, bons de commande, factures normalisées e-MECeF et avoirs.",
      href: "/factures",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      tag: "e-MECeF DGI",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "encaissements",
      name: "Trésorerie & Règlements",
      category: "Finance & Cash",
      description: "Encaissements clients, balance âgée, acomptes et rapprochement.",
      href: "/encaissements",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      tag: "Balance Âgée",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "stock",
      name: "Gestion des Stocks",
      category: "Logistique & Entrepôts",
      description: "Entrepôts, valorisation PMP/FIFO, alertes de rupture et inventaires.",
      href: "/stock/mouvements",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      tag: "PMP & Lots",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      id: "comptabilite",
      name: "Comptabilité SYSCOHADA",
      category: "Comptabilité Générale",
      description: "Plan comptable, écritures, grand-livre, balance et clôture mensuelle.",
      href: "/comptabilite",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      tag: "AUDCIF 2017",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      id: "fiscalite",
      name: "Fiscalité & Déclarations",
      category: "Conformité Légale",
      description: "TVA nette, acomptes IS, retenues AIB, contrôles et fichier FEC.",
      href: "/fiscalite",
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      tag: "Arrêté 1085-C",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      id: "rh",
      name: "Ressources Humaines & Paie",
      category: "Social & Collaborateurs",
      description: "Employés, contrats, cycles de paie, bulletins et charges CNSS/IPTS.",
      href: "/rh",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      tag: "Bulletins & CNSS",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "notes-frais",
      name: "Notes de Frais & Avances",
      category: "Dépenses & Débours",
      description: "Dépenses pros, indemnités kilométriques, per diem et remboursements.",
      href: "/notes-frais",
      iconBg: "bg-teal-50 dark:bg-teal-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
      tag: "Politique Frais",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      ),
    },
    {
      id: "rapports",
      name: "Rapports & Audit Financier",
      category: "Pilotage Stratégique",
      description: "États financiers SYSCOHADA, bilan, compte de résultat et export FEC.",
      href: "/rapports",
      iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      tag: "Liasse Fiscale",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Écosystème des Modules NEXERA
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Accès direct aux 8 domaines fonctionnels interconnectés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={mod.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-700"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${mod.iconBg} ${mod.iconColor}`}
                >
                  {mod.icon}
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {mod.tag}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {mod.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {mod.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                  {mod.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2 text-xs font-semibold text-brand-600 dark:border-gray-800 dark:text-brand-400">
              <span>Ouvrir l&apos;espace</span>
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
