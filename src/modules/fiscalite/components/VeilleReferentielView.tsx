"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type {
  TaxBareme,
  TaxParametrePays,
  TaxSourceReglementaire,
  TaxType,
} from "../types/fiscalite.types";

export const VeilleReferentielView: React.FC = () => {
  const [sources, setSources] = useState<TaxSourceReglementaire[]>([]);
  const [baremes, setBaremes] = useState<TaxBareme[]>([]);
  const [parametres, setParametres] = useState<TaxParametrePays[]>([]);
  const [types, setTypes] = useState<TaxType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"VEILLE" | "BAREMES" | "PARAMETRES">("VEILLE");

  // Formulaire nouvelle source
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceRef, setSourceRef] = useState("Circulaire DGI n° 008/2026");
  const [sourceTitre, setSourceTitre] = useState("Précisions sur les déductions TVA relatives aux prestations numériques");
  const [sourceType, setSourceType] = useState("CIRCULAIRE");
  const [sourceDatePub, setSourceDatePub] = useState("2026-03-01");
  const [sourceDateVigueur, setSourceDateVigueur] = useState("2026-03-15");
  const [sourceResume, setSourceResume] = useState("Modalités d'application des retenues TVA sur prestations transfrontalières.");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, b, p, t] = await Promise.all([
        fiscaliteApi.listSources("BJ"),
        fiscaliteApi.listBaremes(undefined, "BJ"),
        fiscaliteApi.listParametres("BJ"),
        fiscaliteApi.listTypes("BJ"),
      ]);
      setSources(s);
      setBaremes(b);
      setParametres(p);
      setTypes(t);
    } catch (err) {
      console.error("Erreur chargement référentiel:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fiscaliteApi.createSource({
        paysCode: "BJ",
        typeSource: sourceType,
        reference: sourceRef,
        titre: sourceTitre,
        datePublication: sourceDatePub,
        dateEntreeVigueur: sourceDateVigueur,
        resume: sourceResume,
      });
      setShowAddSource(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur création source");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQualifierSource = async (id: string, statut: string) => {
    setActionLoading(true);
    try {
      await fiscaliteApi.qualifierSource(id, { statutVeille: statut });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur qualification source");
    } finally {
      setActionLoading(false);
    }
  };

  const handleValiderBareme = async (id: string) => {
    if (!confirm("Approuver et activer ce barème fiscal (double validation requise EF-008) ?")) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.validerBareme(id, false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur validation barème");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              📜
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Veille Réglementaire &amp; Paramétrage Fiscal
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            CGI Bénin 2026 • Gestion du changement légal (EF-002) • Qualification des textes, barèmes versionnés et paramètres pays.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            ← Tableau de Bord
          </Link>
          <button
            onClick={() => setShowAddSource(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            + Enregistrer une Circulaire / Texte
          </button>
        </div>
      </div>

      {/* Navigation par Onglets */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("VEILLE")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "VEILLE"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Sources Réglementaires &amp; Circulaires ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab("BAREMES")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "BAREMES"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Barèmes Fiscaux Actifs ({baremes.length})
        </button>
        <button
          onClick={() => setActiveTab("PARAMETRES")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "PARAMETRES"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Paramètres Fiscaux Pays ({parametres.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* TAB 1 : Sources Réglementaires */}
          {activeTab === "VEILLE" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        {s.reference}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          s.statutVeille === "APPLIQUEE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : s.statutVeille === "QUALIFIEE"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {s.statutVeille}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {s.titre}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {s.resume || "Aucun résumé renseigné."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span>Vigueur : {new Date(s.dateEntreeVigueur).toLocaleDateString("fr-FR")}</span>
                      {s.statutVeille === "A_QUALIFIER" && (
                        <button
                          onClick={() => handleQualifierSource(s.id, "QUALIFIEE")}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Valider Qualification →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2 : Barèmes Fiscaux */}
          {activeTab === "BAREMES" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Impôt</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Libellé Barème</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Taux Défaut</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Source Légale</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {baremes.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {b.taxType?.code}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {b.libelle}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                        {b.tauxDefaut !== undefined && b.tauxDefaut !== null ? `${b.tauxDefaut}%` : "Tranches"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                        {b.sourceReglementaire?.reference || "CGI 2026"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            b.statut === "ACTIF"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {b.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.statut === "BROUILLON" ? (
                          <button
                            onClick={() => handleValiderBareme(b.id)}
                            disabled={actionLoading}
                            className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                          >
                            Valider (EF-008)
                          </button>
                        ) : (
                          <span className="text-gray-400">✓ Actif</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3 : Paramètres Pays */}
          {activeTab === "PARAMETRES" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Code Paramètre</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Valeur Actuelle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Source Légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {parametres.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {p.code || p.codeParametre}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {p.libelle}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {p.valeurNumerique !== null && p.valeurNumerique !== undefined
                          ? p.valeurNumerique.toLocaleString("fr-FR")
                          : (p.valeurTexte || p.valeur || "—")}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                        {p.sourceReglementaire?.reference || "CGI Bénin 2026"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Ajout Source */}
      {showAddSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Enregistrer une source réglementaire
            </h3>
            <form onSubmit={handleCreateSource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Type de source
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="CIRCULAIRE">Circulaire DGI</option>
                  <option value="NOTE_DE_SERVICE">Note de service</option>
                  <option value="ARRETE">Arrêté Ministériel</option>
                  <option value="LOI_DE_FINANCES">Loi de finances</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Référence formelle
                </label>
                <input
                  type="text"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Titre du texte
                </label>
                <input
                  type="text"
                  value={sourceTitre}
                  onChange={(e) => setSourceTitre(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date publication
                  </label>
                  <input
                    type="date"
                    value={sourceDatePub}
                    onChange={(e) => setSourceDatePub(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Entrée en vigueur
                  </label>
                  <input
                    type="date"
                    value={sourceDateVigueur}
                    onChange={(e) => setSourceDateVigueur(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Résumé &amp; Impact
                </label>
                <textarea
                  value={sourceResume}
                  onChange={(e) => setSourceResume(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddSource(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 shadow-sm"
                >
                  Enregistrer la Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
