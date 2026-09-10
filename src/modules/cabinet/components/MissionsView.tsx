"use client";

import React, { useState } from "react";
import { useMissions } from "../hooks/useMissions";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { useCollaborateurs } from "../hooks/useCollaborateurs";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetStatutMission, CabinetTypeMission } from "../types/cabinet.types";

export function MissionsView() {
  const [filterMandat, setFilterMandat] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const { missionsQuery, createMissionMutation, updateMissionMutation, createTacheMutation } =
    useMissions({
      mandatId: filterMandat || undefined,
      statut: filterStatut || undefined,
    });

  const { mandatsQuery } = usePortefeuille();
  const { collaborateursQuery } = useCollaborateurs();

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isTacheModalOpen, setIsTacheModalOpen] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState("");

  // New Mission form state
  const [mandatId, setMandatId] = useState("");
  const [libelle, setLibelle] = useState("");
  const [typeMission, setTypeMission] = useState<CabinetTypeMission>("RECURRENTE");
  const [periodeReference, setPeriodeReference] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");

  // New Task form state
  const [tacheLibelle, setTacheLibelle] = useState("");
  const [assigneId, setAssigneId] = useState("");
  const [tacheDateEcheance, setTacheDateEcheance] = useState("");

  const missions = missionsQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];
  const collaborateurs = collaborateursQuery.data ?? [];

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatId || !libelle) return;

    await createMissionMutation.mutateAsync({
      cabinetClientMandatId: mandatId,
      libelle,
      typeMission,
      periodeReference: periodeReference || undefined,
      dateEcheance: dateEcheance || undefined,
    });

    setIsMissionModalOpen(false);
    setLibelle("");
    setPeriodeReference("");
    setDateEcheance("");
  };

  const handleCreateTache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId || !tacheLibelle) return;

    await createTacheMutation.mutateAsync({
      cabinetMissionId: selectedMissionId,
      libelle: tacheLibelle,
      collaborateurAssigneId: assigneId || undefined,
      dateEcheance: tacheDateEcheance || undefined,
    });

    setIsTacheModalOpen(false);
    setTacheLibelle("");
    setAssigneId("");
    setTacheDateEcheance("");
  };

  const handleStatusChange = async (missionId: string, newStatut: CabinetStatutMission) => {
    await updateMissionMutation.mutateAsync({
      id: missionId,
      payload: { statut: newStatut },
    });
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Missions & Planification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Découpage en tâches, suivi de charge et alertes de retards par dossier
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMissionModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
          >
            + Nouvelle Mission
          </button>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="w-full sm:w-64">
            <select
              value={filterMandat}
              onChange={(e) => setFilterMandat(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les dossiers / mandats</option>
              {mandats.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.typeMandat} (#{m.clientTenantId.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="PLANIFIEE">PLANIFIEE</option>
              <option value="EN_COURS">EN COURS</option>
              <option value="EN_REVUE">EN REVUE</option>
              <option value="EN_RETARD">EN RETARD</option>
              <option value="TERMINEE">TERMINEE</option>
            </select>
          </div>
        </div>

        {missionsQuery.isLoading ? (
          <LoadingBlock label="Chargement des missions..." />
        ) : missionsQuery.isError ? (
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de charger les missions du cabinet."
          />
        ) : missions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Aucune mission enregistrée pour ce filtre.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {m.typeMission}
                    </span>
                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleStatusChange(m.id, e.target.value as CabinetStatutMission)
                      }
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold focus:outline-none ${
                        m.statut === "TERMINEE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : m.statut === "EN_RETARD"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      <option value="PLANIFIEE">PLANIFIÉE</option>
                      <option value="EN_COURS">EN COURS</option>
                      <option value="EN_REVUE">EN REVUE</option>
                      <option value="EN_RETARD">EN RETARD</option>
                      <option value="TERMINEE">TERMINÉE</option>
                    </select>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                    {m.libelle}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Dossier : <span className="font-medium text-gray-700 dark:text-gray-300">{m.mandat?.typeMandat}</span> ({m.mandat?.clientTenantId.slice(0, 8)})
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      📅 Échéance :{" "}
                      <strong className="text-gray-800 dark:text-gray-200">
                        {m.dateEcheance ? new Date(m.dateEcheance).toLocaleDateString("fr-FR") : "Non fixée"}
                      </strong>
                    </span>
                    {m.periodeReference && (
                      <span>
                        Période : <strong className="text-gray-800 dark:text-gray-200">{m.periodeReference}</strong>
                      </span>
                    )}
                  </div>

                  {/* LISTE DES TÂCHES */}
                  <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <span>Tâches ({m.taches?.length || 0})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMissionId(m.id);
                          setIsTacheModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        + Ajouter tâche
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {m.taches?.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1 text-xs dark:bg-gray-800/60"
                        >
                          <span className="truncate text-gray-700 dark:text-gray-300">
                            {t.libelle}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-gray-400">
                            {t.collaborateurAssigne?.nomPrenoms || "Non assigné"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL NOUVELLE MISSION */}
        {isMissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Créer une nouvelle mission
              </h3>

              <form onSubmit={handleCreateMission} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat Client Associé *
                  </label>
                  <select
                    value={mandatId}
                    onChange={(e) => setMandatId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un mandat...</option>
                    {mandats.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.typeMandat} (#{m.clientTenantId.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Libellé de la mission *
                  </label>
                  <input
                    type="text"
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                    placeholder="Ex: Clôture mensuelle & Déclarations TVA"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Type de Mission
                    </label>
                    <select
                      value={typeMission}
                      onChange={(e) => setTypeMission(e.target.value as CabinetTypeMission)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="RECURRENTE">Récurrente (mensuelle/périodique)</option>
                      <option value="PONCTUELLE">Ponctuelle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Période de référence
                    </label>
                    <input
                      type="text"
                      value={periodeReference}
                      onChange={(e) => setPeriodeReference(e.target.value)}
                      placeholder="Ex: 2026-02"
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMissionModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMissionMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMissionMutation.isPending ? "Création..." : "Créer Mission"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL NOUVELLE TÂCHE */}
        {isTacheModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ajouter une tâche à la mission
              </h3>

              <form onSubmit={handleCreateTache} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Libellé de la tâche *
                  </label>
                  <input
                    type="text"
                    value={tacheLibelle}
                    onChange={(e) => setTacheLibelle(e.target.value)}
                    placeholder="Ex: Rapprochement bancaire BOA"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Collaborateur Assigné
                  </label>
                  <select
                    value={assigneId}
                    onChange={(e) => setAssigneId(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionner un collaborateur...</option>
                    {collaborateurs.map((collab) => (
                      <option key={collab.id} value={collab.id}>
                        {collab.nomPrenoms} ({collab.role?.libelle || "Collaborateur"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date d'échéance de la tâche
                  </label>
                  <input
                    type="date"
                    value={tacheDateEcheance}
                    onChange={(e) => setTacheDateEcheance(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTacheModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createTacheMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createTacheMutation.isPending ? "Ajout..." : "Ajouter Tâche"}
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
