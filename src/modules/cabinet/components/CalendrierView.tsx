"use client";

import React, { useState } from "react";
import { useMissions } from "../hooks/useMissions";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetStatutEcheance } from "../types/cabinet.types";

export function CalendrierView() {
  const [filterMandat, setFilterMandat] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const { calendrierQuery, createEcheanceMutation, updateEcheanceMutation } = useMissions({
    mandatId: filterMandat || undefined,
    statut: filterStatut || undefined,
  });

  const { mandatsQuery } = usePortefeuille();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mandatId, setMandatId] = useState("");
  const [libelle, setLibelle] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [refM7, setRefM7] = useState("");

  const echeances = calendrierQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleCreateEcheance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatId || !libelle || !dateLimite) return;

    await createEcheanceMutation.mutateAsync({
      cabinetClientMandatId: mandatId,
      libelle,
      dateLimite,
      referenceEcheanceM7: refM7 || undefined,
    });

    setIsModalOpen(false);
    setLibelle("");
    setDateLimite("");
    setRefM7("");
  };

  const handleStatusUpdate = async (id: string, statut: CabinetStatutEcheance) => {
    await updateEcheanceMutation.mutateAsync({
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
              Calendrier Consolidé du Cabinet
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vue transversale multi-dossiers des échéances fiscales (M7), sociales et clôtures
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
          >
            + Ajouter une Échéance
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
              <option value="A_VENIR">À VENIR</option>
              <option value="DUE">DUE</option>
              <option value="TRAITEE">TRAITÉE</option>
              <option value="EN_RETARD">EN RETARD</option>
            </select>
          </div>
        </div>

        {calendrierQuery.isLoading ? (
          <LoadingBlock label="Chargement du calendrier consolidé..." />
        ) : calendrierQuery.isError ? (
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de récupérer les échéances consolidées."
          />
        ) : echeances.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Aucune échéance planifiée pour ces critères.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="py-3.5 px-4">Date Limite</th>
                  <th className="py-3.5 px-4">Échéance / Déclaration</th>
                  <th className="py-3.5 px-4">Dossier Client</th>
                  <th className="py-3.5 px-4">Référence Module</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {echeances.map((ech) => {
                  const isLate =
                    ech.statut === "EN_RETARD" ||
                    (ech.statut !== "TRAITEE" && new Date(ech.dateLimite) < new Date());

                  return (
                    <tr
                      key={ech.id}
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                        isLate ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                        {new Date(ech.dateLimite).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ech.libelle}
                        </p>
                        {ech.mission && (
                          <p className="text-xs text-gray-500">
                            Mission : {ech.mission.libelle}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {ech.mandat?.typeMandat} (#{ech.mandat?.clientTenantId.slice(0, 8)})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {ech.referenceEcheanceM7 ? (
                          <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-xs font-mono font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            M7: {ech.referenceEcheanceM7}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Interne</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ech.statut === "TRAITEE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isLate
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isLate && ech.statut !== "TRAITEE" ? "EN RETARD" : ech.statut}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        {ech.statut !== "TRAITEE" ? (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(ech.id, "TRAITEE")}
                            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            Marquer Traitée ✓
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Validé</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL AJOUT ÉCHÉANCE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ajouter une échéance au calendrier consolidé
              </h3>

              <form onSubmit={handleCreateEcheance} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat / Dossier Client *
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
                    Libellé de l'échéance *
                  </label>
                  <input
                    type="text"
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                    placeholder="Ex: Déclaration mensuelle de TVA (CA3)"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date Limite Légale / Contractuelle *
                  </label>
                  <input
                    type="date"
                    value={dateLimite}
                    onChange={(e) => setDateLimite(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Référence Module Fiscalité M7 (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={refM7}
                    onChange={(e) => setRefM7(e.target.value)}
                    placeholder="Ex: TVA-2026-02"
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createEcheanceMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createEcheanceMutation.isPending ? "Ajout..." : "Enregistrer"}
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
