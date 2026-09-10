"use client";

import React, { useState } from "react";
import { useDeontologie } from "../hooks/useDeontologie";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetDecisionConflit } from "../types/cabinet.types";

export function DeontologieView() {
  const [activeTab, setActiveTab] = useState<"conflits" | "journal">("conflits");
  const [selectedMandatId, setSelectedMandatId] = useState("");

  const {
    conflitsQuery,
    journalAccesQuery,
    declareConflitMutation,
    arbitrerConflitMutation,
  } = useDeontologie(selectedMandatId || undefined);

  const { mandatsQuery } = usePortefeuille();

  const [isConflitModalOpen, setIsConflitModalOpen] = useState(false);
  const [isArbitrageModalOpen, setIsArbitrageModalOpen] = useState(false);
  const [selectedConflitId, setSelectedConflitId] = useState("");

  // Declaration form
  const [mandatId, setMandatId] = useState("");
  const [natureConflit, setNatureConflit] = useState("");

  // Arbitrage form
  const [decision, setDecision] = useState<CabinetDecisionConflit>("RETRAIT_DU_DOSSIER");
  const [commentaireDecision, setCommentaireDecision] = useState("");

  const conflits = conflitsQuery.data ?? [];
  const journal = journalAccesQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleDeclareConflit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatId || !natureConflit) return;

    await declareConflitMutation.mutateAsync({
      cabinetClientMandatId: mandatId,
      natureConflit,
    });

    setIsConflitModalOpen(false);
    setNatureConflit("");
  };

  const handleArbitrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflitId) return;

    await arbitrerConflitMutation.mutateAsync({
      id: selectedConflitId,
      payload: {
        decision,
        commentaireDecision: commentaireDecision || undefined,
      },
    });

    setIsArbitrageModalOpen(false);
    setCommentaireDecision("");
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Déontologie & Secret Professionnel
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Prévention des conflits d'intérêts et traçabilité renforcée des accès aux données sensibles
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConflitModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none"
          >
            ⚠️ Déclarer un Conflit d'Intérêt
          </button>
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("conflits")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "conflits"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Registre des Conflits d'Intérêts ({conflits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("journal")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "journal"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Journal d'Accès Secret Professionnel ({journal.length})
          </button>
        </div>

        {activeTab === "conflits" ? (
          <div>
            {conflitsQuery.isLoading ? (
              <LoadingBlock label="Chargement des déclarations..." />
            ) : conflits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucun conflit d'intérêt déclaré à ce jour.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflits.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {c.collaborateur?.nomPrenoms}
                        </span>
                        <span className="text-xs text-gray-400">
                          sur le dossier {c.mandat?.typeMandat} (#{c.mandat?.clientTenantId.slice(0, 8)})
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {c.natureConflit}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Déclaré le {new Date(c.dateDeclaration).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.decision === "RETRAIT_DU_DOSSIER"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : c.decision === "MESURE_SPECIFIQUE"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {c.decision.replace(/_/g, " ")}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConflitId(c.id);
                          setIsArbitrageModalOpen(true);
                        }}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                      >
                        Arbitrer (Associé) ⚖️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <select
                value={selectedMandatId}
                onChange={(e) => setSelectedMandatId(e.target.value)}
                className="block w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tous les dossiers audités...</option>
                {mandats.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.typeMandat} (#{m.clientTenantId.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            {journalAccesQuery.isLoading ? (
              <LoadingBlock label="Chargement du journal d'audit..." />
            ) : journal.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucun événement d'accès tracé pour ces critères.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4">Horodatage UTC</th>
                      <th className="py-3 px-4">Collaborateur</th>
                      <th className="py-3 px-4">Dossier Mandat</th>
                      <th className="py-3 px-4">Module Consulté</th>
                      <th className="py-3 px-4">Action Réalisée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {journal.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(log.dateAcces).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {log.collaborateur?.nomPrenoms || "Collaborateur"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {log.mandat?.typeMandat} (#{log.mandat?.clientTenantId.slice(0, 8)})
                        </td>
                        <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400">
                          {log.moduleConsulte}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {log.actionRealisee || "Consultation standard"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL DÉCLARER CONFLIT */}
        {isConflitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Déclarer un conflit d'intérêt
              </h3>

              <form onSubmit={handleDeclareConflit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat Client Concerné *
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
                    Nature du conflit (Lien personnel, intérêts financiers, etc.) *
                  </label>
                  <textarea
                    value={natureConflit}
                    onChange={(e) => setNatureConflit(e.target.value)}
                    rows={3}
                    placeholder="Décrivez précisément la situation de conflit d'intérêt..."
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConflitModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={declareConflitMutation.isPending}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {declareConflitMutation.isPending ? "Enregistrement..." : "Déclarer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ARBITRAGE ASSOCIÉ */}
        {isArbitrageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Arbitrage du Conflit d'Intérêt
              </h3>

              <form onSubmit={handleArbitrer} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Décision de l'Associé *
                  </label>
                  <select
                    value={decision}
                    onChange={(e) =>
                      setDecision(e.target.value as CabinetDecisionConflit)
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="RETRAIT_DU_DOSSIER">
                      Retrait immédiat du collaborateur du dossier
                    </option>
                    <option value="MESURE_SPECIFIQUE">
                      Mesure spécifique d'encadrement / double visa
                    </option>
                    <option value="AUCUNE_ACTION">
                      Aucune action nécessaire (Non avéré)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Commentaire / Motivation de la décision
                  </label>
                  <textarea
                    value={commentaireDecision}
                    onChange={(e) => setCommentaireDecision(e.target.value)}
                    rows={2}
                    placeholder="Justifiez la décision arbitrale..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsArbitrageModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={arbitrerConflitMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {arbitrerConflitMutation.isPending ? "Arbitrage..." : "Appliquer la Décision"}
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
