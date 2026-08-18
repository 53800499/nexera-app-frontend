"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat } from "../types/rh.types";
import { ContratFormModal } from "./ContratFormModal";
import { SimulateurIndemniteModal } from "./SimulateurIndemniteModal";

export const ContratListView: React.FC = () => {
  const [contrats, setContrats] = useState<RhContrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSimulateurOpen, setIsSimulateurOpen] = useState(false);

  const fetchContrats = async () => {
    try {
      setLoading(true);
      const res = await rhApi.listContrats({
        statut: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setContrats(Array.isArray(res) ? res : ((res as any)?.data || []));
    } catch (err) {
      console.error("Erreur chargement contrats:", err);
      setContrats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContrats();
  }, [statusFilter]);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const safeContrats = Array.isArray(contrats) ? contrats : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Contrats & Carrières
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Contrats de travail (CDI, CDD, Stage), périodes d'essai et simulateur légal d'indemnités CCGT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulateurOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-colors shadow-xs"
          >
            <span>🧮</span>
            <span>Simulateur CCGT</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Nouveau Contrat</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="CLOTURE">Clôturé / Terminé</option>
            <option value="RESILIE">Résilié</option>
          </select>
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {safeContrats.length} contrat(s) répertorié(s)
        </div>
      </div>

      {/* Tableau des Contrats */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Contrat</th>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">Type & Poste</th>
                <th className="px-6 py-4">Période</th>
                <th className="px-6 py-4 text-right">Salaire Brut Base</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des contrats...</p>
                  </td>
                </tr>
              ) : safeContrats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                      📄
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun contrat trouvé</p>
                    <p className="mt-1 text-xs text-gray-400">Créez un nouveau contrat de travail pour vos salariés.</p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                    >
                      + Nouveau Contrat
                    </button>
                  </td>
                </tr>
              ) : (
                safeContrats.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {c.numeroContrat}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {c.employe ? `${c.employe.nom} ${c.employe.prenoms}` : "Inconnu"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {c.employe?.matricule}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                          {c.typeContrat}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {c.poste?.intitule || "Poste"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>Du {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString("fr-FR") : "-"}</div>
                      <div className="text-gray-400">
                        {c.dateFinPrevue
                          ? `Au ${new Date(c.dateFinPrevue).toLocaleDateString("fr-FR")}`
                          : "Durée indéterminée"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white font-mono">
                      {formatCurrency(c.salaireBaseMensuel)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.statut === "ACTIF"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : c.statut === "BROUILLON"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        }`}
                      >
                        {c.statut}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ContratFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchContrats}
      />

      <SimulateurIndemniteModal
        isOpen={isSimulateurOpen}
        onClose={() => setIsSimulateurOpen(false)}
      />
    </div>
  );
};
