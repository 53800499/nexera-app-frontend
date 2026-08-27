"use client";

import React, { useState } from "react";
import { useEmployes } from "@/modules/rh/hooks/useEmployes";
import { useMissions } from "../hooks/useNotesFrais";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { IconClose } from "./NdfIcons";

export const MissionsAvancesView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const { missions, avances, isLoading, createMission, createAvance } = useMissions();
  const { employes } = useEmployes();

  const [activeTab, setActiveTab] = useState<"MISSIONS" | "AVANCES">("MISSIONS");
  const [isModalMissionOpen, setIsModalMissionOpen] = useState(false);
  const [isModalAvanceOpen, setIsModalAvanceOpen] = useState(false);

  // Form Mission
  const [missionEmployeId, setMissionEmployeId] = useState("");
  const [missionObjet, setMissionObjet] = useState("");
  const [missionLieu, setMissionLieu] = useState("");
  const [missionDebut, setMissionDebut] = useState(new Date().toISOString().split("T")[0]);
  const [missionFin, setMissionFin] = useState(new Date().toISOString().split("T")[0]);

  // Form Avance
  const [avanceEmployeId, setAvanceEmployeId] = useState("");
  const [avanceMissionId, setAvanceMissionId] = useState("");
  const [avanceMontant, setAvanceMontant] = useState<number>(100000);
  const [avanceDate, setAvanceDate] = useState(new Date().toISOString().split("T")[0]);

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionEmployeId || !missionObjet) return;

    void runAction({
      loadingMessage: "Création de l'ordre de mission...",
      success: {
        title: "Ordre de mission créé",
        message: missionObjet,
      },
      error: {
        title: "Erreur de création",
        message: "Impossible de créer l'ordre de mission.",
      },
      action: async () => {
        await createMission({
          employeRefId: missionEmployeId,
          objet: missionObjet,
          lieuDestination: missionLieu || undefined,
          dateDebut: missionDebut,
          dateFin: missionFin,
        });
        setIsModalMissionOpen(false);
        setMissionObjet("");
        setMissionLieu("");
      },
    });
  };

  const handleCreateAvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avanceEmployeId) return;

    void runAction({
      loadingMessage: "Enregistrement de la demande d'avance...",
      success: {
        title: "Avance sur frais enregistrée",
        message: `Montant accordé : ${formatCurrency(avanceMontant)}`,
      },
      error: {
        title: "Erreur d'enregistrement",
        message: "Impossible d'enregistrer la demande d'avance.",
      },
      action: async () => {
        await createAvance({
          employeRefId: avanceEmployeId,
          missionId: avanceMissionId || undefined,
          montant: Number(avanceMontant),
          deviseCode: "XOF",
          dateVersement: avanceDate,
        });
        setIsModalAvanceOpen(false);
      },
    });
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ordres de Mission & Avances de Frais
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion préalable des déplacements, cadrage budgétaire et suivi des avances de trésorerie
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (employes.length > 0 && !missionEmployeId) setMissionEmployeId(employes[0].id);
              setIsModalMissionOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 transition"
          >
            <span>+ Ordre de Mission</span>
          </button>
          <button
            onClick={() => {
              if (employes.length > 0 && !avanceEmployeId) setAvanceEmployeId(employes[0].id);
              setIsModalAvanceOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <span>+ Verser une Avance</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("MISSIONS")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "MISSIONS"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Ordres de Mission ({missions.length})
        </button>
        <button
          onClick={() => setActiveTab("AVANCES")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "AVANCES"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Avances de Trésorerie ({avances.length})
        </button>
      </div>

      {/* Contenu Missions */}
      {activeTab === "MISSIONS" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Salarié</th>
                  <th className="px-4 py-3 font-semibold">Objet de la mission</th>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold text-center">Avances</th>
                  <th className="px-4 py-3 font-semibold text-center">Notes de Frais</th>
                  <th className="px-4 py-3 font-semibold text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Chargement des missions...
                    </td>
                  </tr>
                ) : missions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Aucun ordre de mission enregistré.
                    </td>
                  </tr>
                ) : (
                  missions.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {m.employe ? `${m.employe.nom} ${m.employe.prenoms}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {m.objet}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {m.lieuDestination || "Bénin"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(m.dateDebut).toLocaleDateString("fr-FR")} au {new Date(m.dateFin).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {m.avances?.length || 0} avance(s)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {m.rapportsFrais?.length || 0} rapport(s)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            m.statut === "EN_COURS"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : m.statut === "TERMINEE"
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          }`}
                        >
                          {m.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenu Avances */}
      {activeTab === "AVANCES" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date Versement</th>
                  <th className="px-4 py-3 font-semibold">Salarié</th>
                  <th className="px-4 py-3 font-semibold">Mission</th>
                  <th className="px-4 py-3 font-semibold text-right">Montant Versé</th>
                  <th className="px-4 py-3 font-semibold text-right">Régularisé</th>
                  <th className="px-4 py-3 font-semibold text-right">Solde Dû</th>
                  <th className="px-4 py-3 font-semibold text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Chargement des avances...
                    </td>
                  </tr>
                ) : avances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Aucune avance de trésorerie enregistrée.
                    </td>
                  </tr>
                ) : (
                  avances.map((av) => (
                    <tr key={av.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(av.dateVersement).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {av.employe ? `${av.employe.nom} ${av.employe.prenoms}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {av.mission?.objet || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(av.montant)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(av.montantRegularise)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(av.montant - av.montantRegularise)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            av.statut === "SOLDEE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : av.statut === "PARTIELLEMENT_REGULARISEE"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          }`}
                        >
                          {av.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Créer Mission */}
      {isModalMissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Créer un Ordre de Mission
              </h3>
              <button
                onClick={() => setIsModalMissionOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IconClose className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMission} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Salarié en mission *
                </label>
                <select
                  required
                  value={missionEmployeId}
                  onChange={(e) => setMissionEmployeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez un salarié...</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.matricule} - {e.nom} {e.prenoms}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Objet de la mission *
                </label>
                <input
                  type="text"
                  required
                  value={missionObjet}
                  onChange={(e) => setMissionObjet(e.target.value)}
                  placeholder="Ex: Audit annuel filiale Parakou & Djougou"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Lieu / Destination
                </label>
                <input
                  type="text"
                  value={missionLieu}
                  onChange={(e) => setMissionLieu(e.target.value)}
                  placeholder="Ex: Parakou, Bénin"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Date début *
                  </label>
                  <input
                    type="date"
                    required
                    value={missionDebut}
                    onChange={(e) => setMissionDebut(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={missionFin}
                    onChange={(e) => setMissionFin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalMissionOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600"
                >
                  Créer la mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Créer Avance */}
      {isModalAvanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Verser une Avance sur Frais
              </h3>
              <button
                onClick={() => setIsModalAvanceOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IconClose className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAvance} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Salarié bénéficiaire *
                </label>
                <select
                  required
                  value={avanceEmployeId}
                  onChange={(e) => setAvanceEmployeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez un salarié...</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.matricule} - {e.nom} {e.prenoms}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Ordre de Mission Associé (Optionnel)
                </label>
                <select
                  value={avanceMissionId}
                  onChange={(e) => setAvanceMissionId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Aucune mission rattachée</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.objet} ({m.lieuDestination || "Bénin"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Montant de l'avance (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  value={avanceMontant}
                  onChange={(e) => setAvanceMontant(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date de versement *
                </label>
                <input
                  type="date"
                  required
                  value={avanceDate}
                  onChange={(e) => setAvanceDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalAvanceOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600"
                >
                  Enregistrer l'avance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
