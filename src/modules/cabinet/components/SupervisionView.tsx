"use client";

import React, { useState } from "react";
import { useSupervision } from "../hooks/useSupervision";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type {
  CabinetModuleSource,
  CabinetNiveauSeverite,
  CabinetStatutPointRevue,
} from "../types/cabinet.types";
import {
  formatTypeMandat,
  formatModuleSource,
  formatObjetMetier,
  formatNiveauSeverite,
  formatStatutPointRevue,
  formatMandatSelectOption,
} from "../utils/cabinetLabels";

export function SupervisionView() {
  const [filterModule, setFilterModule] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterMandat, setFilterMandat] = useState("");

  const {
    pointsRevueQuery,
    checklistsQuery,
    createPointRevueMutation,
    updatePointRevueMutation,
  } = useSupervision({
    mandatId: filterMandat || undefined,
    moduleSource: filterModule || undefined,
    niveau: filterNiveau || undefined,
    statut: filterStatut || undefined,
  });

  const { mandatsQuery } = usePortefeuille();
  const { companiesQuery } = useLinkedCompanies();

  const getClientName = (tenantId?: string | null) =>
    companiesQuery.data?.find((c) => c.id === tenantId)?.name;

  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [mandatId, setMandatId] = useState("");
  const [moduleSource, setModuleSource] = useState<CabinetModuleSource>("M3_COMPTABILITE");
  const [objetType, setObjetType] = useState("ecriture_comptable");
  const [objetId, setObjetId] = useState("00000000-0000-0000-0000-000000000000");
  const [texte, setTexte] = useState("");
  const [niveau, setNiveau] = useState<CabinetNiveauSeverite>("A_CORRIGER");

  const points = pointsRevueQuery.data ?? [];
  const checklists = checklistsQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatId || !texte) return;

    await createPointRevueMutation.mutateAsync({
      cabinetClientMandatId: mandatId,
      moduleSource,
      objetType,
      objetId,
      texte,
      niveau,
    });

    setIsPointModalOpen(false);
    setTexte("");
  };

  const handleStatusChange = async (id: string, statut: CabinetStatutPointRevue) => {
    await updatePointRevueMutation.mutateAsync({
      id,
      payload: { statut },
    });
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Supervision & Points de Revue Transverses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contrôle qualité sans production sur M1 (Stock), M2 (Ventes), M3 (Compta), M4 (Paie), M5 (Frais) et M7 (Fiscalité)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPointModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            + Poser une Observation
          </button>
        </div>

        {/* FILTRES PAR MODULE & NIVEAU */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="w-full sm:w-56">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les modules sources</option>
              <option value="M1_STOCK">Stocks & Achats (Module 1)</option>
              <option value="M2_GESTION_COMMERCIALE">Facturation & Ventes (Module 2)</option>
              <option value="M3_COMPTABILITE">Comptabilité Générale (Module 3)</option>
              <option value="M4_RH_PAIE">Ressources Humaines & Paie (Module 4)</option>
              <option value="M5_NOTES_FRAIS">Notes de Frais (Module 5)</option>
              <option value="M7_FISCALITE">Fiscalité & Déclarations (Module 7)</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Toutes les sévérités</option>
              <option value="BLOQUANT">Bloquant (Interdit la clôture)</option>
              <option value="A_CORRIGER">À corriger (Action requise)</option>
              <option value="INFORMATION">Informationnelle (Pour avis)</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les statuts de revue</option>
              <option value="OUVERT">Ouvert (En attente)</option>
              <option value="EN_TRAITEMENT">En cours de traitement</option>
              <option value="RESOLU">Résolu (Validé)</option>
              <option value="ECARTE">Écarté (Non retenu)</option>
            </select>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={filterMandat}
              onChange={(e) => setFilterMandat(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les dossiers clients</option>
              {mandats.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatMandatSelectOption(m, getClientName(m.clientTenantId))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pointsRevueQuery.isLoading ? (
          <LoadingBlock label="Chargement des points de revue..." />
        ) : pointsRevueQuery.isError ? (
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de récupérer les points de revue."
          />
        ) : points.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Aucun point de revue trouvé pour ces critères de recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {points.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.niveau === "BLOQUANT"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : p.niveau === "A_CORRIGER"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {formatNiveauSeverite(p.niveau)}
                    </span>
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {formatModuleSource(p.moduleSource)} • {formatObjetMetier(p.objetType)}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {formatMandatSelectOption(p.mandat, getClientName(p.mandat?.clientTenantId))}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 dark:text-white">
                    {p.texte}
                  </p>

                  <p className="text-xs text-gray-500">
                    Auteur :{" "}
                    <strong className="text-gray-700 dark:text-gray-300">
                      {p.auteur?.nomPrenoms || "Collaborateur Cabinet"}
                    </strong>{" "}
                    — Le {new Date(p.dateCreation).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={p.statut}
                    onChange={(e) =>
                      handleStatusChange(p.id, e.target.value as CabinetStatutPointRevue)
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none ${
                      p.statut === "RESOLU"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                        : p.statut === "ECARTE"
                          ? "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    <option value="OUVERT">Ouvert</option>
                    <option value="EN_TRAITEMENT">En traitement</option>
                    <option value="RESOLU">Résolu ✓</option>
                    <option value="ECARTE">Écarté</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODÈLES DE CHECKLISTS QUALITÉ DU CABINET */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Checklists de Contrôle Qualité Référencées
          </h2>
          <p className="text-xs text-gray-500">
            Modèles de diligences normalisées SYSCOHADA et audit pour les collaborateurs
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {checklists.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {c.libelle}
                  </h4>
                  <span className="text-xs font-mono text-gray-400">v{c.version}</span>
                </div>
                <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
                  Cible : {formatTypeMandat(c.typeMissionCible)}
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {c.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-1.5">
                      <span className="text-brand-500">✓</span> {item.libelle}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL NOUVEAU POINT DE REVUE */}
        {isPointModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Poser une observation / Point de revue
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Annotation non destructive attachée à un objet métier client pour revue.
              </p>

              <form onSubmit={handleCreatePoint} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Dossier Client *
                  </label>
                  <select
                    value={mandatId}
                    onChange={(e) => setMandatId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un dossier client...</option>
                    {mandats.map((m) => (
                      <option key={m.id} value={m.id}>
                        {formatMandatSelectOption(m, getClientName(m.clientTenantId))}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Module Source *
                    </label>
                    <select
                      value={moduleSource}
                      onChange={(e) => setModuleSource(e.target.value as CabinetModuleSource)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="M3_COMPTABILITE">Module 3 : Comptabilité SYSCOHADA</option>
                      <option value="M4_RH_PAIE">Module 4 : RH & Paie</option>
                      <option value="M5_NOTES_FRAIS">Module 5 : Notes de Frais</option>
                      <option value="M7_FISCALITE">Module 7 : Fiscalité & Liasses</option>
                      <option value="M1_STOCK">Module 1 : Stocks & Achats</option>
                      <option value="M2_GESTION_COMMERCIALE">Module 2 : Ventes & Facturation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Degré de sévérité *
                    </label>
                    <select
                      value={niveau}
                      onChange={(e) => setNiveau(e.target.value as CabinetNiveauSeverite)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="A_CORRIGER">À Corriger (Action requise)</option>
                      <option value="BLOQUANT">Bloquant (Interdit la validation)</option>
                      <option value="INFORMATION">Information (Pour observation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type d'objet métier
                  </label>
                  <input
                    type="text"
                    value={objetType}
                    onChange={(e) => setObjetType(e.target.value)}
                    placeholder="Ex: ecriture_comptable, bulletin_paie, note_frais"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Commentaire / Anomalie constatée *
                  </label>
                  <textarea
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    rows={3}
                    placeholder="Détaillez le problème détecté et la correction attendue..."
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPointModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createPointRevueMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {createPointRevueMutation.isPending ? "Enregistrement..." : "Enregistrer l'Observation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireCabinetAccess>
  );
}
