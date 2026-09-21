"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { FecExportResult, TaxContribuable } from "../types/fiscalite.types";

export const FecExportView: React.FC = () => {
  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [dateCloture, setDateCloture] = useState("2026-12-31");
  const [separateur, setSeparateur] = useState<"POINT_VIRGULE" | "TABULATION">("POINT_VIRGULE");
  const [formatFichier, setFormatFichier] = useState<"CSV" | "TXT">("CSV");
  const [resultat, setResultat] = useState<FecExportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fiscaliteApi
      .getMonProfil()
      .then((p) => setContribuable(p))
      .catch((e) => console.error(e));
  }, []);

  const handleGenererFec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable?.id) return;
    setIsLoading(true);
    try {
      const res = await fiscaliteApi.genererFec(contribuable.id, {
        dateCloture,
        separateur,
        formatFichier,
      });
      setResultat(res);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la génération du fichier FEC");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultat) return;
    const blob = new Blob([resultat.contenuFichier], { type: resultat.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultat.nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              ⚡
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Export FEC — Fichier des Écritures Comptables (Arrêté 1085-C)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Norme officielle de la République du Bénin • 18 champs obligatoires • Audit de conformité et équilibre Débit/Crédit avant remise à la DGI.
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

      {/* Cadre Référence Réglementaire Arrêté 1085-C */}
      <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-orange-50/50 p-5 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-orange-950/10 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <span>Arrêté Ministériel n° 1085-C/MEF/CAB/SGM/DGI/DLC/159SGG20 (Bénin)</span>
        </div>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          En application des articles 673 et suivants du Code Général des Impôts, les contribuables tenant une comptabilité informatisée doivent remettre à l&apos;Administration fiscale, dès le début des opérations de vérification, une copie dématérialisée du fichier des écritures comptables respectant 18 colonnes normalisées (format <code>FEC_IFU_AAAAMMJJ</code>).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de Configuration de l'Export */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Paramètres du Fichier FEC
          </h2>

          <form onSubmit={handleGenererFec} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Identifiant Fiscal Unique (IFU)
              </label>
              <input
                type="text"
                disabled
                value={contribuable?.identifiantFiscalUnique || "0202612345678"}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-sm font-mono font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Date de clôture de l&apos;exercice
              </label>
              <input
                type="date"
                value={dateCloture}
                onChange={(e) => setDateCloture(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Séparateur de colonnes (Art. 6)
              </label>
              <select
                value={separateur}
                onChange={(e) => setSeparateur(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="POINT_VIRGULE">Point-virgule (;) — Recommandé Excel / CSV</option>
                <option value="TABULATION">Tabulation (\t) — Format officiel DGI / TXT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Format de fichier de sortie
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormatFichier("CSV")}
                  className={`rounded-lg border p-2 text-center text-xs font-medium transition ${
                    formatFichier === "CSV"
                      ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  .CSV (Tableur)
                </button>
                <button
                  type="button"
                  onClick={() => setFormatFichier("TXT")}
                  className={`rounded-lg border p-2 text-center text-xs font-medium transition ${
                    formatFichier === "TXT"
                      ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  .TXT (Fichier plat)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition shadow-sm"
            >
              {isLoading ? "Vérification & Génération en cours..." : "Générer & Auditer le FEC"}
            </button>
          </form>
        </div>

        {/* Rapport d'Audit de Conformité & Téléchargement */}
        <div className="lg:col-span-2 space-y-4">
          {resultat ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-6">
              {/* Entête du fichier généré */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-gray-900 dark:text-white">
                      {resultat.nomFichier}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        resultat.auditConformite.conforme
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}
                    >
                      {resultat.auditConformite.conforme ? "CONFORME ARRÊTÉ 1085-C" : "ANOMALIES DÉTECTÉES"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Taille du fichier : {(resultat.tailleOctets / 1024).toFixed(1)} Ko • {resultat.auditConformite.nombreLignes} lignes d&apos;écritures
                  </p>
                </div>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  <span>⬇ Télécharger le Fichier</span>
                </button>
              </div>

              {/* Métriques d'équilibre Débit = Crédit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-3.5 dark:bg-gray-700/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Cumulé Débit</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(resultat.auditConformite.totalDebit)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3.5 dark:bg-gray-700/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Cumulé Crédit</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(resultat.auditConformite.totalCredit)}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3.5 ${
                    resultat.auditConformite.ecart === 0
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Écart Débit - Crédit</p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      resultat.auditConformite.ecart === 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {formatCurrency(resultat.auditConformite.ecart)}
                  </p>
                </div>
              </div>

              {/* Liste des anomalies si non-conforme */}
              {resultat.auditConformite.anomalies.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Anomalies bloquantes détectées lors de l&apos;audit de conformité :
                  </p>
                  <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-400 space-y-1">
                    {resultat.auditConformite.anomalies.map((ano, i) => (
                      <li key={i}>{ano}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aperçu des 18 colonnes normalisées */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Aperçu des premières écritures (18 colonnes normalisées)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-72">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-[11px] font-mono">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">CodeJournal</th>
                        <th className="px-2 py-2 text-left">NumEcriture</th>
                        <th className="px-2 py-2 text-left">Date</th>
                        <th className="px-2 py-2 text-left">NumCompte</th>
                        <th className="px-2 py-2 text-left">LibCompte</th>
                        <th className="px-2 py-2 text-left">LibEcriture</th>
                        <th className="px-2 py-2 text-right">MontDebit</th>
                        <th className="px-2 py-2 text-right">MontCredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                      {(resultat.lignes || []).slice(0, 10).map((l: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-2 py-1.5 font-bold">{l.codeJournal}</td>
                          <td className="px-2 py-1.5">{l.numEcriture}</td>
                          <td className="px-2 py-1.5">{l.dateEcriture}</td>
                          <td className="px-2 py-1.5 font-bold">{l.numCompte}</td>
                          <td className="px-2 py-1.5 truncate max-w-[120px]">{l.libCompte}</td>
                          <td className="px-2 py-1.5 truncate max-w-[150px]">{l.libEcriture}</td>
                          <td className="px-2 py-1.5 text-right font-bold">{l.montDebit ? formatCurrency(l.montDebit) : "-"}</td>
                          <td className="px-2 py-1.5 text-right font-bold">{l.montCredit ? formatCurrency(l.montCredit) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/80">
              Configurez la date de clôture et le format souhaité, puis cliquez sur &quot;Générer &amp; Auditer le FEC&quot; pour lancer le contrôle et obtenir le fichier prêt à remettre à l&apos;Administration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
