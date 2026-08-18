"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhEmploye } from "../types/rh.types";
import { EmployeDetail360Modal } from "./EmployeDetail360Modal";
import { EmployeFormModal } from "./EmployeFormModal";
import { ContratFormModal } from "./ContratFormModal";
import { GroupIcon, EyeIcon, PlusIcon, PencilIcon, TrashBinIcon, DocsIcon } from "@/icons";
import { useActionFeedback } from "@/shared/components/feedback";

export const EmployeListView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const [employes, setEmployes] = useState<RhEmploye[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [selectedEmploye, setSelectedEmploye] = useState<RhEmploye | null>(null);
  const [is360Open, setIs360Open] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [employeToEdit, setEmployeToEdit] = useState<RhEmploye | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [contractEmployeId, setContractEmployeId] = useState<string | undefined>(undefined);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      const res = await rhApi.listEmployes({
        q: search || undefined,
        statutEmploi: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      const items = Array.isArray(res) ? res : ((res as any)?.data || []);
      setEmployes(items);
    } catch (err) {
      console.error("Erreur chargement salariés:", err);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployes();
  };

  const handleOpenEdit = (emp: RhEmploye) => {
    setEmployeToEdit(emp);
    setIsEditOpen(true);
  };

  const handleOpenNewContract = (emp: RhEmploye) => {
    setContractEmployeId(emp.id);
    setIsContractModalOpen(true);
  };

  const handleDeleteEmploye = async (emp: RhEmploye) => {
    await runAction({
      loadingMessage: `Archivage du dossier ${emp.nom} ${emp.prenoms}...`,
      success: {
        title: "Salarié archivé",
        message: `Le collaborateur ${emp.nom} ${emp.prenoms} a été archivé avec succès.`,
      },
      error: {
        title: "Erreur d'archivage",
        message: "Impossible d'archiver le salarié.",
      },
      action: async () => {
        await rhApi.deleteEmploye(emp.id);
        await fetchEmployes();
      },
    });
  };

  const safeEmployes = Array.isArray(employes) ? employes : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Répertoire des Salariés
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dossiers administratifs 360°, contrats, carrière et coordonnées des collaborateurs
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
          <span>Nouveau Salarié</span>
        </button>
      </div>

      {/* Barre de filtres & recherche */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule, email, IFU..."
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="EN_CONGE">En Congé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="DEMISSIONNE">Démissionné</option>
              <option value="LICENCIE">Licencié</option>
              <option value="RETRAITE">Retraité</option>
            </select>
          </div>

          <div className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {safeEmployes.length} collaborateur(s)
          </div>
        </div>
      </div>

      {/* Tableau des Employés */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">Matricule</th>
                <th className="px-6 py-4">Poste & Département</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des salariés...</p>
                  </td>
                </tr>
              ) : safeEmployes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                      <GroupIcon className="h-6 w-6 shrink-0 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun salarié trouvé</p>
                    <p className="mt-1 text-xs text-gray-400">Commencez par ajouter votre premier collaborateur.</p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                    >
                      <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>Nouveau Salarié</span>
                    </button>
                  </td>
                </tr>
              ) : (
                safeEmployes.map((emp) => {
                  const affectation = emp.affectations?.find((a) => a.estActuelle) || emp.affectations?.[0];
                  const dateEntree = emp.dateEntreeEntreprise || emp.dateEntree;
                  const contactInfo = emp.emailProfessionnel || emp.telephone1 || emp.telephonePrincipal || "-";
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 shadow-2xs">
                            {emp.nom?.[0] || "?"}
                            {emp.prenoms?.[0] || ""}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {emp.nom} {emp.prenoms}
                            </div>
                            <div className="text-xs text-gray-500">
                              Entré le {dateEntree ? new Date(dateEntree).toLocaleDateString("fr-FR") : "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {emp.matricule}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {affectation?.poste?.intitule || "Non assigné"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {affectation?.departement?.libelle || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900 dark:text-white">
                          {contactInfo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.statutEmploi === "ACTIF"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : emp.statutEmploi === "EN_CONGE"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            }`}
                        >
                          {emp.statutEmploi || "ACTIF"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          {/* Fiche 360° */}
                          <button
                            onClick={() => {
                              setSelectedEmploye(emp);
                              setIs360Open(true);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-brand-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            title="Voir la fiche 360° et le dossier complet"
                          >
                            <EyeIcon className="h-5 w-5 shrink-0" />
                          </button>

                          {/* Nouveau Contrat */}
                          <button
                            onClick={() => handleOpenNewContract(emp)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-purple-500 hover:bg-gray-200 hover:text-purple-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            title="Créer un contrat de travail"
                          >
                            <DocsIcon className="h-6 w-6 shrink-0" />
                          </button>

                          {/* Modifier Salarié */}
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            title="Modifier les coordonnées et informations"
                          >
                            <PencilIcon className="h-5 w-5 shrink-0" />
                          </button>

                          {/* Archiver / Supprimer */}
                          <button
                            onClick={() => handleDeleteEmploye(emp)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-800 dark:text-gray-400 dark:hover:bg-red-950/30 transition-colors"
                            title="Archiver le collaborateur"
                          >
                            <TrashBinIcon className="h-5 w-5 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale Dossier 360° */}
      <EmployeDetail360Modal
        employe={selectedEmploye}
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
        onEditEmploye={(emp) => {
          setIs360Open(false);
          handleOpenEdit(emp);
        }}
        onRefresh={fetchEmployes}
      />

      {/* Modale Nouveau Salarié */}
      <EmployeFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchEmployes}
      />

      {/* Modale Modifier Salarié */}
      <EmployeFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEmployeToEdit(null);
        }}
        onSuccess={fetchEmployes}
        employeToEdit={employeToEdit}
      />

      {/* Modale Nouveau Contrat de travail rattaché */}
      <ContratFormModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setContractEmployeId(undefined);
        }}
        onSuccess={fetchEmployes}
        initialEmployeId={contractEmployeId}
      />
    </div>
  );
};
