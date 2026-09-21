"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhDeclarationSocialeFiscale } from "../types/rh.types";
import { DocsIcon } from "@/icons";
import { formatDeclarationType, formatDeclarationStatus } from "../utils/rhFormatters";
import { ErrorState } from "@/shared/components/feedback";

export const DeclarationsSocialesFiscalesView: React.FC = () => {
  const [declarations, setDeclarations] = useState<RhDeclarationSocialeFiscale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annee, setAnnee] = useState(2026);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await rhApi.listDeclarations(undefined, annee);
      setDeclarations(Array.isArray(res) ? res : ((res as any)?.data || []));
    } catch (err: any) {
      console.warn("Erreur déclarations:", err?.message || err);
      setError(
        err?.message ||
          "Serveur ou réseau indisponible. Vérifiez la connexion au serveur API et réessayez.",
      );
      setDeclarations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, [annee]);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  const safeDeclarations = Array.isArray(declarations) ? declarations : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Déclarations Fiscales & Sociales (M7)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Déclarations mensuelles ITS, VPS (4 %) et Cotisations CNSS (Bénin / DGI / CNSS)
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Année :</span>
          <select
            value={annee}
            onChange={(e) => setAnnee(parseInt(e.target.value, 10))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value={2026}>2026 (CGI 2026)</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Barre de statut */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Déclarations obligatoires (DGI & CNSS)
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {safeDeclarations.length} déclaration(s)
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={fetchDeclarations}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Période</th>
                <th className="px-6 py-4">Type de Déclaration</th>
                <th className="px-6 py-4">Établissement</th>
                <th className="px-6 py-4 text-right">Assiette / Base Brute</th>
                <th className="px-6 py-4 text-right">Montant Dû (FCFA)</th>
                <th className="px-6 py-4">Salariés</th>
                <th className="px-6 py-4">Date Limite Légale</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des déclarations...</p>
                  </td>
                </tr>
              ) : error && safeDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6">
                    <ErrorState
                      title="Serveur ou réseau indisponible"
                      message={error}
                      onRetry={fetchDeclarations}
                    />
                  </td>
                </tr>
              ) : safeDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                      <DocsIcon className="h-6 w-6 shrink-0 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Aucune déclaration générée pour {annee}</p>
                    <p className="mt-1 text-xs text-gray-400">Ouvrez un cycle de paie et cliquez sur "Déclarations M7".</p>
                  </td>
                </tr>
              ) : (
                safeDeclarations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {d.periodeDeclaration}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                          {d.typeDeclaration.startsWith("ITS") ? "ITS" : d.typeDeclaration.startsWith("VPS") ? "VPS" : "CNSS"}
                        </span>
                        <span>{formatDeclarationType(d.typeDeclaration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{d.etablissement?.raisonSociale}</td>
                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(d.montantBase)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(d.montantTotal)}
                    </td>
                    <td className="px-6 py-4">{d.nombreSalariesConcernes} salariés</td>
                    <td className="px-6 py-4 text-xs font-medium text-amber-700 dark:text-amber-400">
                      Avant le {d.dateLimiteLegale ? new Date(d.dateLimiteLegale).toLocaleDateString("fr-FR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const st = formatDeclarationStatus(d.statut);
                        return (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badgeClass}`}>
                            {st.label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
