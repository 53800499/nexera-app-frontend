"use client";

import React, { useState } from "react";
import { useHonoraires } from "../hooks/useHonoraires";
import { useMissions } from "../hooks/useMissions";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetStatutNoteHonoraires } from "../types/cabinet.types";

export function HonorairesView() {
  const [activeTab, setActiveTab] = useState<"temps" | "notes">("temps");
  const [filterMandat, setFilterMandat] = useState("");

  const {
    tempsQuery,
    notesQuery,
    createTempsMutation,
    createNoteMutation,
    updateNoteMutation,
  } = useHonoraires({
    mandatId: filterMandat || undefined,
  });

  const { missionsQuery } = useMissions({
    mandatId: filterMandat || undefined,
  });
  const { mandatsQuery } = usePortefeuille();

  const [isTempsModalOpen, setIsTempsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Temps form
  const [missionId, setMissionId] = useState("");
  const [datePrestation, setDatePrestation] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dureeHeures, setDureeHeures] = useState(2);
  const [description, setDescription] = useState("");
  const [facturable, setFacturable] = useState(true);

  // Note form
  const [mandatId, setMandatId] = useState("");
  const [noteNumero, setNoteNumero] = useState(
    `HON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
  );
  const [dateEmission, setDateEmission] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [montantHt, setMontantHt] = useState(500000);
  const [tauxTva, setTauxTva] = useState(18); // 18% UEMOA standard
  const [ligneLibelle, setLigneLibelle] = useState("Prestations de tenue comptable et révision");

  const temps = tempsQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const missions = missionsQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleCreateTemps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionId || dureeHeures <= 0) return;

    await createTempsMutation.mutateAsync({
      cabinetMissionId: missionId,
      datePrestation,
      dureeHeures: Number(dureeHeures),
      description: description || undefined,
      facturable,
    });

    setIsTempsModalOpen(false);
    setDescription("");
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandatId || montantHt <= 0) return;

    const tva = (montantHt * tauxTva) / 100;
    const ttc = montantHt + tva;

    await createNoteMutation.mutateAsync({
      cabinetClientMandatId: mandatId,
      numero: noteNumero,
      dateEmission,
      montantTotalHt: montantHt,
      montantTva: tva,
      montantTotalTtc: ttc,
      deviseCode: "XOF",
      statut: "EMISE",
      lignes: [
        {
          libelle: ligneLibelle,
          quantite: 1,
          prixUnitaire: montantHt,
          montant: montantHt,
        },
      ],
    });

    setIsNoteModalOpen(false);
  };

  const handleStatusChange = async (id: string, statut: CabinetStatutNoteHonoraires) => {
    await updateNoteMutation.mutateAsync({
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
              Temps Passé & Facturation des Honoraires
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Saisie des feuilles de temps collaborateurs et émission des notes d'honoraires cabinet
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTempsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              ⏱️ Déclarer du Temps
            </button>
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
            >
              + Émettre Note d'Honoraires
            </button>
          </div>
        </div>

        {/* ONGLETS NAVIGATION */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("temps")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "temps"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Relevés de Temps ({temps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "notes"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Notes d'Honoraires Émises ({notes.length})
          </button>
        </div>

        {activeTab === "temps" ? (
          <div>
            {tempsQuery.isLoading ? (
              <LoadingBlock label="Chargement des temps passés..." />
            ) : tempsQuery.isError ? (
              <ErrorState
                title="Erreur de chargement"
                message="Impossible de récupérer les feuilles de temps."
              />
            ) : temps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucun temps saisi pour le moment.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Collaborateur</th>
                      <th className="py-3.5 px-4">Mission / Dossier</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Durée</th>
                      <th className="py-3.5 pr-4 text-right">Facturable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {temps.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {new Date(t.datePrestation).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                          {t.collaborateur?.nomPrenoms}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t.mission?.libelle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t.mission?.mandat?.typeMandat} (#{t.mission?.mandat?.clientTenantId.slice(0, 8)})
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600 dark:text-gray-300">
                          {t.description || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                          {t.dureeHeures} h
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              t.facturable
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {t.facturable ? "Oui" : "Non"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {notesQuery.isLoading ? (
              <LoadingBlock label="Chargement des factures d'honoraires..." />
            ) : notesQuery.isError ? (
              <ErrorState
                title="Erreur de chargement"
                message="Impossible de récupérer les notes d'honoraires."
              />
            ) : notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucune note d'honoraires émise.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                    <tr>
                      <th className="py-3.5 px-4">Numéro</th>
                      <th className="py-3.5 px-4">Date Émission</th>
                      <th className="py-3.5 px-4">Dossier Mandat</th>
                      <th className="py-3.5 px-4">Total HT</th>
                      <th className="py-3.5 px-4">Total TTC</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notes.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                          {n.numero}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          {new Date(n.dateEmission).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {n.mandat?.typeMandat} (#{n.mandat?.clientTenantId.slice(0, 8)})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                          {n.montantTotalHt.toLocaleString("fr-FR")} {n.deviseCode}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                          {n.montantTotalTtc.toLocaleString("fr-FR")} {n.deviseCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={n.statut}
                            onChange={(e) =>
                              handleStatusChange(n.id, e.target.value as CabinetStatutNoteHonoraires)
                            }
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold focus:outline-none ${
                              n.statut === "PAYEE"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : n.statut === "EN_RETARD"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            <option value="BROUILLON">BROUILLON</option>
                            <option value="EMISE">ÉMISE</option>
                            <option value="PAYEE">PAYÉE ✓</option>
                            <option value="EN_RETARD">EN RETARD</option>
                            <option value="ANNULEE">ANNULÉE</option>
                          </select>
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                          >
                            PDF / Reçu 🖨️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL SAISIE TEMPS */}
        {isTempsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Saisir une prestation de temps passé
              </h3>

              <form onSubmit={handleCreateTemps} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mission associée *
                  </label>
                  <select
                    value={missionId}
                    onChange={(e) => setMissionId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez une mission...</option>
                    {missions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.libelle} ({m.mandat?.typeMandat})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date de prestation *
                    </label>
                    <input
                      type="date"
                      value={datePrestation}
                      onChange={(e) => setDatePrestation(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Durée en heures *
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={dureeHeures}
                      onChange={(e) => setDureeHeures(Number(e.target.value))}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Description du travail effectué
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Ex: Rapprochements bancaires BOA et Ecobank Q4..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="facturable"
                    checked={facturable}
                    onChange={(e) => setFacturable(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="facturable" className="text-xs text-gray-700 dark:text-gray-300">
                    Prestation facturable au client
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTempsModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createTempsMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createTempsMutation.isPending ? "Enregistrement..." : "Enregistrer Temps"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ÉMISSION NOTE HONORAIRES */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Émettre une note d'honoraires cabinet
              </h3>

              <form onSubmit={handleCreateNote} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat Client Bénéficiaire *
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Numéro Facture / Note *
                    </label>
                    <input
                      type="text"
                      value={noteNumero}
                      onChange={(e) => setNoteNumero(e.target.value)}
                      required
                      className="mt-1 block w-full font-mono rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date d'Émission *
                    </label>
                    <input
                      type="date"
                      value={dateEmission}
                      onChange={(e) => setDateEmission(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Libellé de la prestation principale *
                  </label>
                  <input
                    type="text"
                    value={ligneLibelle}
                    onChange={(e) => setLigneLibelle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Montant Total HT (XOF) *
                    </label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={montantHt}
                      onChange={(e) => setMontantHt(Number(e.target.value))}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Taux TVA (%)
                    </label>
                    <input
                      type="number"
                      value={tauxTva}
                      onChange={(e) => setTauxTva(Number(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <p>
                    Montant TVA :{" "}
                    <strong>{((montantHt * tauxTva) / 100).toLocaleString("fr-FR")} XOF</strong>
                  </p>
                  <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    Total TTC à payer :{" "}
                    {(montantHt + (montantHt * tauxTva) / 100).toLocaleString("fr-FR")} XOF
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createNoteMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createNoteMutation.isPending ? "Émission..." : "Émettre la Note"}
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
