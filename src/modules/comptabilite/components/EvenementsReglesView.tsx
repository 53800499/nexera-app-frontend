"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaEvenementSource,
  ComptaJournal,
  ComptaRegleComptabilisation,
} from "../types/comptabilite.types";
import { CogFlowIcon, PlusIcon, ArrowPathIcon } from "./ComptaIcons";

export const EvenementsReglesView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [activeTab, setActiveTab] = useState<"EVENEMENTS" | "REGLES">("EVENEMENTS");
  const [evenements, setEvenements] = useState<ComptaEvenementSource[]>([]);
  const [regles, setRegles] = useState<ComptaRegleComptabilisation[]>([]);
  const [journaux, setJournaux] = useState<ComptaJournal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nouvelle Règle
  const [showModal, setShowModal] = useState(false);
  const [typeEvenement, setTypeEvenement] = useState("invoice.issued");
  const [critereCategorie, setCritereCategorie] = useState("");
  const [critereTva, setCritereTva] = useState<number | undefined>(18);
  const [compteDebitId, setCompteDebitId] = useState("");
  const [compteCreditId, setCompteCreditId] = useState("");
  const [journalCibleId, setJournalCibleId] = useState("");
  const [comptes, setComptes] = useState<any[]>([]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setIsLoading(true);
    try {
      const [evs, rgs, jx, cp] = await Promise.all([
        comptabiliteApi.getEvenements(),
        comptabiliteApi.getRegles(),
        comptabiliteApi.getJournaux(),
        comptabiliteApi.getPlanComptable({ actif: true }),
      ]);
      setEvenements(evs);
      setRegles(rgs);
      setJournaux(jx);
      setComptes(cp);
      if (jx.length > 0) setJournalCibleId(jx[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetraiter = async (id: string) => {
    try {
      await comptabiliteApi.retraiterEvenement(id);
      showResult({
        variant: "success",
        title: "Événement retraité",
        message: "Événement retraitement comptable effectué avec succès.",
      });
      chargerDonnees();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur retraitement",
        message: err.message || "Erreur lors du retraitement de l'événement.",
      });
    }
  };

  const handleCreateRegle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await comptabiliteApi.createRegle({
        typeEvenement,
        critereCategorieArticle: critereCategorie || null,
        critereTauxTva: critereTva !== undefined ? Number(critereTva) : null,
        compteDebitId: compteDebitId || null,
        compteCreditId: compteCreditId || null,
        journalCibleId,
        actif: true,
      });
      setShowModal(false);
      showResult({
        variant: "success",
        title: "Règle créée",
        message: "La règle de comptabilisation a été créée avec succès.",
      });
      chargerDonnees();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur création règle",
        message: err.message || "Erreur lors de la création de la règle.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Moteur de Comptabilisation & Flux Amont
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Intégration d'événements opérationnels (M1 Facturation, M2 Stocks, M4 RH, M5 Frais, M7 Fiscalité) et règles SYSCOHADA (UC-06).
          </p>
        </div>
        {activeTab === "REGLES" && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle Règle
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("EVENEMENTS")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "EVENEMENTS"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Événements Reçus ({evenements.length})
          </button>
          <button
            onClick={() => setActiveTab("REGLES")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "REGLES"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Règles de Détermination des Comptes ({regles.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Événements Reçus */}
      {activeTab === "EVENEMENTS" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <th className="py-3 px-4">Date Réception</th>
                <th className="py-3 px-4">Module Source</th>
                <th className="py-3 px-4">Type Événement</th>
                <th className="py-3 px-4">Réf. Externe</th>
                <th className="py-3 px-4">Statut Traitement</th>
                <th className="py-3 px-4">Écriture Brouillon</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {evenements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Aucun événement reçu des modules amont pour le moment.
                  </td>
                </tr>
              ) : (
                evenements.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {new Date(ev.recuLe).toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {ev.moduleSource}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white">
                      {ev.typeEvenement}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                      {ev.referenceExterne}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          ev.statutTraitement === "TRAITE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : ev.statutTraitement === "ANOMALIE"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {ev.statutTraitement}
                      </span>
                      {ev.motifAnomalie && (
                        <p className="mt-0.5 text-[10px] text-rose-500">{ev.motifAnomalie}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400">
                      {ev.ecrituresGenerees && ev.ecrituresGenerees.length > 0
                        ? ev.ecrituresGenerees[0].numEcriture || "BROUILLON"
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ev.statutTraitement === "ANOMALIE" && (
                        <button
                          type="button"
                          onClick={() => handleRetraiter(ev.id)}
                          title="Retraiter l'événement en anomalie"
                          aria-label="Retraiter"
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 transition shadow-xs"
                        >
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Règles de Comptabilisation */}
      {activeTab === "REGLES" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <th className="py-3 px-4">Événement Source</th>
                <th className="py-3 px-4">Critères (Catégorie / TVA)</th>
                <th className="py-3 px-4">Compte Débit</th>
                <th className="py-3 px-4">Compte Crédit</th>
                <th className="py-3 px-4">Journal Cible</th>
                <th className="py-3 px-4 text-center">Spécificité</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {regles.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                    {r.typeEvenement}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {r.critereCategorieArticle ? `Cat: ${r.critereCategorieArticle}` : "Toutes catégories"}
                    {r.critereTauxTva ? ` • TVA: ${r.critereTauxTva}%` : ""}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {r.compteDebit?.numero || r.compteDebit?.numeroCompte || "411"} — {r.compteDebit?.intitule || r.compteDebit?.libelle || "Compte Tiers"}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-purple-600 dark:text-purple-400">
                    {r.compteCredit?.numero || r.compteCredit?.numeroCompte || "701"} — {r.compteCredit?.intitule || r.compteCredit?.libelle || "Compte Produit"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    {r.journalCible?.codeJournal} ({r.journalCible?.libelle})
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Niv. {r.niveauSpecificite}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        r.actif
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {r.actif ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Création Règle */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Créer une Règle de Comptabilisation Automatique
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Règle EF-027 : La règle la plus spécifique sera automatiquement appliquée lors de la réception d'un événement.
            </p>

            <form onSubmit={handleCreateRegle} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Type d'événement source
                </label>
                <select
                  value={typeEvenement}
                  onChange={(e) => setTypeEvenement(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="invoice.issued">M1 — Facture Émise (invoice.issued)</option>
                  <option value="payment.received">M1 — Paiement Reçu (payment.received)</option>
                  <option value="stock.inventory_closed">M2 — Variation de Stock (stock.inventory_closed)</option>
                  <option value="rh.payroll.cycle_validated">M4 — Cycle Paie Validé (rh.payroll.cycle_validated)</option>
                  <option value="ndf.expense_approved">M5 — Note de Frais Approuvée (ndf.expense_approved)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Catégorie d'article (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: MARCHANDISE, SERVICE"
                    value={critereCategorie}
                    onChange={(e) => setCritereCategorie(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    value={critereTva ?? ""}
                    onChange={(e) => setCritereTva(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Compte Débit
                  </label>
                  <select
                    value={compteDebitId}
                    onChange={(e) => setCompteDebitId(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionner compte...</option>
                    {comptes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numero} — {c.intitule}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Compte Crédit
                  </label>
                  <select
                    value={compteCreditId}
                    onChange={(e) => setCompteCreditId(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionner compte...</option>
                    {comptes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numero} — {c.intitule}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Journal Cible
                </label>
                <select
                  value={journalCibleId}
                  onChange={(e) => setJournalCibleId(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {journaux.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.codeJournal} — {j.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500"
                >
                  Créer la Règle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
