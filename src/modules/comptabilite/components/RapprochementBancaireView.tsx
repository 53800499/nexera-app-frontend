"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type { ComptaJournal } from "../types/comptabilite.types";
import { BankIcon, CheckStampIcon, PlusIcon } from "./ComptaIcons";

export const RapprochementBancaireView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [journauxBanque, setJournauxBanque] = useState<ComptaJournal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<string>("");
  const [etatRapprochement, setEtatRapprochement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal Import Relevé
  const [showImportModal, setShowImportModal] = useState(false);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().substring(0, 8) + "01");
  const [dateFin, setDateFin] = useState(new Date().toISOString().substring(0, 10));
  const [soldeOuverture, setSoldeOuverture] = useState(0);
  const [soldeCloture, setSoldeCloture] = useState(0);
  const [csvContent, setCsvContent] = useState("");

  useEffect(() => {
    comptabiliteApi.getJournaux().then((data) => {
      const bqs = data.filter((j) => j.typeJournal === "BANQUE");
      setJournauxBanque(bqs);
      if (bqs.length > 0) {
        setSelectedJournal(bqs[0].id);
      }
    });
  }, []);

  const handleImporterReleve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJournal) return;

    // Parser CSV simple (Date;Libelle;Montant;Reference)
    const lines = csvContent.trim().split("\n");
    const lignesParsed: any[] = [];

    for (const l of lines) {
      const parts = l.split(";").map((p) => p.trim());
      if (parts.length >= 3) {
        const d = parts[0];
        const lib = parts[1];
        const m = parseFloat(parts[2].replace(",", ".").replace(/\s/g, ""));
        const ref = parts[3] || "";
        if (!isNaN(m)) {
          lignesParsed.push({
            dateOperation: d,
            libelle: lib,
            montant: m,
            referenceBancaire: ref,
          });
        }
      }
    }

    if (lignesParsed.length === 0) {
      showResult({
        variant: "error",
        title: "Format CSV invalide",
        message: "Aucune ligne valide trouvée dans le relevé. Format attendu : Date(AAAA-MM-JJ);Libellé;Montant;Référence",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await comptabiliteApi.importerReleve({
        journalId: selectedJournal,
        formatSource: "CSV",
        dateDebut,
        dateFin,
        soldeOuverture: Number(soldeOuverture) || 0,
        soldeCloture: Number(soldeCloture) || 0,
        lignes: lignesParsed,
      });

      setShowImportModal(false);
      setCsvContent("");
      showResult({
        variant: "success",
        title: "Relevé importé",
        message: `Relevé intégré : ${res.importedCount} ligne(s) importée(s), ${res.duplicateCount} doublon(s) ignoré(s) (EF-042).`,
      });

      // Rapprochement automatique immédiat
      if (res.releveId) {
        await comptabiliteApi.rapprocherAutomatique(res.releveId);
        const etat = await comptabiliteApi.getEtatRapprochement(res.releveId);
        setEtatRapprochement(etat);
      }
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur import relevé",
        message: err.message || "Erreur lors de l'import du relevé bancaire.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Rapprochement Bancaire Assisté
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Confrontation du relevé bancaire officiel et des écritures de trésorerie (Compte 521) (UC-11).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Importer un Relevé Bancaire
          </button>
        </div>
      </div>

      {/* Journal Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Compte de Banque (Journal Cible)
        </label>
        <select
          value={selectedJournal}
          onChange={(e) => setSelectedJournal(e.target.value)}
          className="mt-1 w-full max-w-md rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {journauxBanque.map((j) => (
            <option key={j.id} value={j.id}>
              {j.codeJournal} — {j.libelle} ({j.compteContrepartie?.numero || "521"})
            </option>
          ))}
        </select>
      </div>

      {/* État de Rapprochement Summary */}
      {etatRapprochement ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-900/30 bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BankIcon className="w-5 h-5 text-emerald-400" />
              État de Rapprochement Bancaire au{" "}
              {new Date(etatRapprochement.dateFin).toLocaleDateString("fr-FR")}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono text-sm">
              <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                <span className="text-xs text-slate-300 block">Solde Relevé Bancaire :</span>
                <span className="text-lg font-bold text-emerald-300">
                  {formatCurrency(etatRapprochement.soldeBancaireFin)}
                </span>
              </div>
              <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                <span className="text-xs text-slate-300 block">Opérations Relevé Non Compta :</span>
                <span className="text-lg font-bold text-amber-300">
                  {etatRapprochement.lignesReleveNonRapprochees?.length || 0} lignes
                </span>
              </div>
              <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                <span className="text-xs text-slate-300 block">Chèques / Écritures en Suspens :</span>
                <span className="text-lg font-bold text-blue-300">
                  {etatRapprochement.ecrituresNonRapprochees?.length || 0} écritures
                </span>
              </div>
            </div>
          </div>

          {/* 2 Colonnes : Lignes relevé non rapprochées vs Écritures comptables non débitées */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Lignes Relevé Non Rapprochées */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">
                Opérations Bancaires en Suspens ({etatRapprochement.lignesReleveNonRapprochees?.length || 0})
              </h3>
              <div className="mt-3 space-y-2">
                {etatRapprochement.lignesReleveNonRapprochees?.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">
                    Toutes les lignes du relevé ont été appariées aux écritures comptables.
                  </p>
                ) : (
                  etatRapprochement.lignesReleveNonRapprochees.map((l: any) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {l.libelle}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(l.dateOperation).toLocaleDateString("fr-FR")} • Réf: {l.referenceBancaire || "—"}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(l.montant))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Écritures Comptables Non Débitées */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">
                Écritures Comptables en Suspens ({etatRapprochement.ecrituresNonRapprochees?.length || 0})
              </h3>
              <div className="mt-3 space-y-2">
                {etatRapprochement.ecrituresNonRapprochees?.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">
                    Aucune écriture comptable en suspens sur ce compte de trésorerie.
                  </p>
                ) : (
                  etatRapprochement.ecrituresNonRapprochees.map((el: any) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {el.libelleLigne || el.ecriture?.libelle}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(el.ecriture?.dateEcriture).toLocaleDateString("fr-FR")} • N° {el.ecriture?.numEcriture}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {Number(el.montantDebit) > 0
                          ? `D: ${formatCurrency(Number(el.montantDebit))}`
                          : `C: ${formatCurrency(Number(el.montantCredit))}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <BankIcon className="mx-auto h-12 w-12 text-gray-400 opacity-60" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Aucun état de rapprochement actif pour le moment
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Importez un fichier de relevé bancaire (CSV, OFX) pour lancer le rapprochement automatique.
          </p>
        </div>
      )}

      {/* Modal Import Relevé */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Importer un Relevé Bancaire (CSV / OFX)
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Règle EF-042 : Les lignes déjà importées sont automatiquement dédupliquées par empreinte SHA-256.
            </p>

            <form onSubmit={handleImporterReleve} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Période Début
                  </label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Période Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Solde d'Ouverture (XOF)
                  </label>
                  <input
                    type="number"
                    value={soldeOuverture}
                    onChange={(e) => setSoldeOuverture(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Solde de Clôture (XOF)
                  </label>
                  <input
                    type="number"
                    value={soldeCloture}
                    onChange={(e) => setSoldeCloture(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Lignes de Relevé (Format : Date;Libellé;Montant;Référence)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`2026-02-05;Virement Client ABC;150000;VIR-883\n2026-02-12;Prélèvement Électricité;-45000;PREL-SBEE\n2026-02-28;Frais Tenue de Compte;-3500;AGIOS`}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 font-mono text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? "Import & Rapprochement..." : "Lancer le Rapprochement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
