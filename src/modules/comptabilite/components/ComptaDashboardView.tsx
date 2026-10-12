"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  BalanceGeneraleResponse,
  ComptaEcriture,
  ComptaExercice,
} from "../types/comptabilite.types";
import {
  BankIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckStampIcon,
  CogFlowIcon,
  DocumentArrowDownIcon,
  LockClosedIcon,
  PlusIcon,
  ScaleBalanceIcon,
} from "./ComptaIcons";

export const ComptaDashboardView: React.FC = () => {
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [exerciceCourant, setExerciceCourant] = useState<ComptaExercice | null>(null);
  const [balance, setBalance] = useState<BalanceGeneraleResponse | null>(null);
  const [enAttente, setEnAttente] = useState<ComptaEcriture[]>([]);
  const [dernieresEcritures, setDernieresEcritures] = useState<ComptaEcriture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setIsLoading(true);
    try {
      const exs = await comptabiliteApi.getExercices();
      setExercices(exs);
      const courant = exs.find((e) => e.statut === "OUVERT") || exs[0];
      setExerciceCourant(courant || null);

      if (courant) {
        const [bal, att, rec] = await Promise.all([
          comptabiliteApi.getBalanceGenerale(courant.id).catch(() => null),
          comptabiliteApi.getEnAttenteValidation().catch(() => []),
          comptabiliteApi.getEcritures({ exerciceId: courant.id }).catch(() => []),
        ]);
        setBalance(bal);
        setEnAttente(att);
        setDernieresEcritures(rec.slice(0, 8));
      }
    } catch (err) {
      console.error("Erreur chargement dashboard comptable:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Calculs Trésorerie, Produits, Charges
  let totalTresorerie = 0;
  let totalProduits = 0;
  let totalCharges = 0;

  if (balance?.lignes) {
    for (const l of balance.lignes) {
      if (l.numero.startsWith("52") || l.numero.startsWith("53") || l.numero.startsWith("57")) {
        totalTresorerie += l.soldeFinalDebit - l.soldeFinalCredit;
      } else if (l.numero.startsWith("7")) {
        totalProduits += l.soldeFinalCredit - l.soldeFinalDebit;
      } else if (l.numero.startsWith("6")) {
        totalCharges += l.soldeFinalDebit - l.soldeFinalCredit;
      }
    }
  }

  const resultatProvisoire = totalProduits - totalCharges;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-blue-900/30 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-400/30">
                Module 3 — SYSCOHADA
              </span>
              <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                Exercice {exerciceCourant?.annee || 2026} ({exerciceCourant?.statut || "OUVERT"})
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Comptabilité Générale & Tiers
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Système Comptable OHADA révisé (AUDCIF) — Enregistrement, validation, balance 6 colonnes et états légaux.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/comptabilite/ecritures"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
            >
              <PlusIcon className="w-4 h-4" />
              Nouvelle Écriture
            </Link>
            <Link
              href="/comptabilite/validation"
              className="relative inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <CheckStampIcon className="w-4 h-4 text-emerald-400" />
              Validation
              {enAttente.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                  {enAttente.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Trésorerie Nette */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Trésorerie Actuelle
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <BankIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalTresorerie)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Comptes classe 5 (Banque 521 + Caisse 531)
            </p>
          </div>
        </div>

        {/* Chiffre d'Affaires */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Produits / Ventes
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ChartBarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalProduits)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Comptes classe 7 (Cumul exercice)
            </p>
          </div>
        </div>

        {/* Charges d'Exploitation */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Charges d'Exploitation
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <ScaleBalanceIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalCharges)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Comptes classe 6 (Cumul exercice)
            </p>
          </div>
        </div>

        {/* Résultat Provisoire */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Résultat Net Provisoire
            </span>
            <div className={`rounded-lg p-2 ${resultatProvisoire >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"}`}>
              <BookOpenIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-bold ${resultatProvisoire >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(resultatProvisoire)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {resultatProvisoire >= 0 ? "Bénéfice provisoire" : "Déficit provisoire"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Link
          href="/comptabilite/plan-comptable"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition dark:bg-indigo-950/50">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            Plan SYSCOHADA
          </span>
          <span className="text-[10px] text-gray-400">Classes 1 à 9</span>
        </Link>

        <Link
          href="/comptabilite/grand-livre"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition dark:bg-blue-950/50">
            <ScaleBalanceIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            Grand Livre
          </span>
          <span className="text-[10px] text-gray-400">Mouvements & Soldes</span>
        </Link>

        <Link
          href="/comptabilite/balances"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition dark:bg-emerald-950/50">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            Balance 6 Col.
          </span>
          <span className="text-[10px] text-gray-400">Générale & Auxiliaire</span>
        </Link>

        <Link
          href="/comptabilite/lettrage"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition dark:bg-amber-950/50">
            <CheckStampIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            Lettrage Tiers
          </span>
          <span className="text-[10px] text-gray-400">Clients & Fournisseurs</span>
        </Link>

        <Link
          href="/comptabilite/rapprochement"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition dark:bg-purple-950/50">
            <BankIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            Rapprochement
          </span>
          <span className="text-[10px] text-gray-400">Import CSV & OFX</span>
        </Link>

        <Link
          href="/comptabilite/etats-financiers"
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition dark:bg-teal-950/50">
            <DocumentArrowDownIcon className="w-5 h-5" />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
            États & FEC
          </span>
          <span className="text-[10px] text-gray-400">Bilan, CR, Arrêté 1085</span>
        </Link>
      </div>

      {/* Recent Entries & Pending Approvals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dernières Écritures (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Dernières Écritures Journal
              </h2>
              <p className="text-xs text-gray-500">Mouvements comptables récents</p>
            </div>
            <Link
              href="/comptabilite/ecritures"
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Voir tout le journal →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
                  <th className="py-2">Date</th>
                  <th className="py-2">N° Écriture</th>
                  <th className="py-2">Journal</th>
                  <th className="py-2">Libellé</th>
                  <th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dernieresEcritures.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Aucune écriture enregistrée pour cet exercice.
                    </td>
                  </tr>
                ) : (
                  dernieresEcritures.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2.5 font-medium text-gray-900 dark:text-white">
                        {new Date(e.dateEcriture).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 dark:text-gray-300">
                        {e.numEcriture || "BROUILLON"}
                      </td>
                      <td className="py-2.5">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {e.journal?.codeJournal || "OD"}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-700 dark:text-gray-300">
                        {e.libelle}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            e.statut === "VALIDEE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : e.statut === "EN_ATTENTE_VALIDATION"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : e.statut === "REJETEE"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {e.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Écritures en attente & Alertes (1 col) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Contrôle & Validation
              </h2>
              <p className="text-xs text-gray-500">File d'approbation comptable</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {enAttente.length} en attente
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {enAttente.length === 0 ? (
              <div className="py-8 text-center">
                <CheckStampIcon className="mx-auto h-8 w-8 text-emerald-500 opacity-60" />
                <p className="mt-2 text-xs text-gray-400">
                  Toutes les écritures sont à jour et validées.
                </p>
              </div>
            ) : (
              enAttente.slice(0, 5).map((ea) => (
                <div
                  key={ea.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {ea.libelle}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {ea.journal?.libelle} • {new Date(ea.dateEcriture).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Link
                    href={`/comptabilite/validation`}
                    className="shrink-0 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
                  >
                    Examiner
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Contrôles SYSCOHADA
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Plan SYSCOHADA 9 classes activé
              </li>
              <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Balance générale équilibrée (D = C)
              </li>
              <li className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Séparation des tâches active (EF-008)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
