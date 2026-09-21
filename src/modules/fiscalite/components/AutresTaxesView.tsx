"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxDeclarationGenerique } from "../types/fiscalite.types";

export const AutresTaxesView: React.FC = () => {
  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [declarations, setDeclarations] = useState<TaxDeclarationGenerique[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulateur Patente (CGI Art. 202)
  const [patenteCa, setPatenteCa] = useState<number>(150000000);
  const [patenteZone, setPatenteZone] = useState<"ZONE_1" | "ZONE_2">("ZONE_1");
  const [patenteSimResult, setPatenteSimResult] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const list = await fiscaliteApi.listDeclarationsGeneriques(p.id);
        setDeclarations(list);
      }
    } catch (err) {
      console.error("Erreur chargement autres taxes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSimulatePatente(150000000, "ZONE_1");
  }, []);

  const handleSimulatePatente = async (ca: number, zone: string) => {
    try {
      const res = await fiscaliteApi.simulerPatente({
        chiffreAffaires: ca,
        zoneAdministrative: zone,
      });
      setPatenteSimResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              🏛
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Autres Taxes &amp; Contribution des Patentes
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Moteur fiscal générique (EF-001) • Contribution des Patentes (CGI Bénin Art. 202) • Taxe Professionnelle Synthétique (TPS) • Taxes locales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            ← Tableau de Bord
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulateur Patente */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Simulateur Contribution des Patentes
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chiffre d&apos;Affaires Annuel HT (FCFA)
            </label>
            <input
              type="number"
              value={patenteCa}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPatenteCa(val);
                handleSimulatePatente(val, patenteZone);
              }}
              min={0}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Zone administrative de l&apos;établissement (CGI Art. 202)
            </label>
            <select
              value={patenteZone}
              onChange={(e) => {
                const z = e.target.value as any;
                setPatenteZone(z);
                handleSimulatePatente(patenteCa, z);
              }}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ZONE_1">1ère Zone (Cotonou, Porto-Novo, Parakou, Abomey-Calavi)</option>
              <option value="ZONE_2">2ème Zone (Autres communes du Bénin)</option>
            </select>
          </div>

          {patenteSimResult && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Droit Fixe de base :</span>
                <span className="font-bold">{formatCurrency(patenteSimResult.droitFixe)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Droit Proportionnel :</span>
                <span className="font-bold">{formatCurrency(patenteSimResult.droitProportionnel)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 pt-2 border-t border-amber-200 dark:border-amber-800">
                <span className="font-semibold">Total Patente Annuelle :</span>
                <span className="font-bold text-base text-amber-800 dark:text-amber-300">
                  {formatCurrency(patenteSimResult.totalPatente)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                Échéance légale de paiement : au plus tard le 31 janvier de chaque année.
              </p>
            </div>
          )}
        </div>

        {/* Historique des Déclarations Génériques */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Déclarations Génériques Enregistrées
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {declarations.length} déclaration(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : declarations.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
              Aucune déclaration de taxe générique enregistrée. Les déclarations de taxe foncière, droits d&apos;enregistrement et redevances s&apos;afficheront ici.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Type de Taxe</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Exercice / Période</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Base Imposable</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Montant Dû</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {declarations.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">
                        {d.taxType?.libelle || "Taxe locale"}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {d.periodeOuExercice}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">
                        {d.baseImposable ? formatCurrency(d.baseImposable) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(d.montantCalcule)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {d.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
