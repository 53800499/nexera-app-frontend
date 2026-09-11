"use client";

import React, { useState } from "react";
import { useCollaborateurs } from "../hooks/useCollaborateurs";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetNiveauHabilitation } from "../types/cabinet.types";
import {
  formatTypeMandat,
  formatNiveauHabilitation,
  formatMandatSelectOption,
} from "../utils/cabinetLabels";

export function CollaborateursView() {
  const [selectedMandatId, setSelectedMandatId] = useState("");

  const {
    collaborateursQuery,
    rolesQuery,
    habilitationsQuery,
    createCollaborateurMutation,
    createHabilitationMutation,
    deleteHabilitationMutation,
  } = useCollaborateurs(selectedMandatId || undefined);

  const { mandatsQuery } = usePortefeuille();
  const { companiesQuery } = useLinkedCompanies();

  const getClientName = (tenantId?: string | null) =>
    companiesQuery.data?.find((c) => c.id === tenantId)?.name;

  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isHabModalOpen, setIsHabModalOpen] = useState(false);

  // New Collab form
  const [nomPrenoms, setNomPrenoms] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [numeroOrdre, setNumeroOrdre] = useState("");

  // New Habilitation form
  const [habCollabId, setHabCollabId] = useState("");
  const [niveauAcces, setNiveauAcces] = useState<CabinetNiveauHabilitation>(
    "ANNOTATION",
  );

  const collaborateurs = collaborateursQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const habilitations = habilitationsQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomPrenoms || !email || !roleId) return;

    await createCollaborateurMutation.mutateAsync({
      nomPrenoms,
      email,
      roleId,
      numeroOrdreProfessionnel: numeroOrdre || undefined,
    });

    setIsCollabModalOpen(false);
    setNomPrenoms("");
    setEmail("");
    setNumeroOrdre("");
  };

  const handleCreateHabilitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandatId || !habCollabId) return;

    await createHabilitationMutation.mutateAsync({
      collaborateurId: habCollabId,
      cabinetClientMandatId: selectedMandatId,
      niveauAcces,
    });

    setIsHabModalOpen(false);
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Équipe du Cabinet & Habilitations Dossiers
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Modèle de sécurité à double niveau : affectations nominatives et droits gradués
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCollabModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            + Nouveau Collaborateur
          </button>
        </div>

        {/* ANNUAIRE DE L'ÉQUIPE */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Membres du Cabinet ({collaborateurs.length})
          </h2>

          {collaborateursQuery.isLoading ? (
            <LoadingBlock label="Chargement des collaborateurs..." />
          ) : collaborateurs.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">
              Aucun collaborateur enregistré.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collaborateurs.map((collab) => (
                <div
                  key={collab.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {collab.nomPrenoms.charAt(0)}
                    </span>
                    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      {collab.role?.libelle || "Collaborateur"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                    {collab.nomPrenoms}
                  </h3>
                  <p className="text-xs text-gray-500">{collab.email}</p>
                  {collab.numeroOrdreProfessionnel && (
                    <p className="mt-1 font-mono text-[10px] text-purple-600 dark:text-purple-400">
                      Ordre : {collab.numeroOrdreProfessionnel}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-800">
                    <span>
                      Mandats : <strong>{collab._count?.mandatsResponsable ?? 0}</strong>
                    </span>
                    <span>
                      Tâches : <strong>{collab._count?.taches ?? 0}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MATRICE D'HABILITATION PAR DOSSIER */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Matrice des Habilitations par Mandat Client
              </h2>
              <p className="text-xs text-gray-500">
                Aucun accès par défaut : chaque collaborateur doit recevoir une habilitation nominative
              </p>
            </div>
            {selectedMandatId && (
              <button
                type="button"
                onClick={() => setIsHabModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                + Habiliter un collaborateur
              </button>
            )}
          </div>

          <div className="mt-4">
            <select
              value={selectedMandatId}
              onChange={(e) => setSelectedMandatId(e.target.value)}
              className="block w-full sm:w-96 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Sélectionnez un dossier client pour gérer les habilitations...</option>
              {mandats.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatMandatSelectOption(m, getClientName(m.clientTenantId))}
                </option>
              ))}
            </select>
          </div>

          {selectedMandatId && (
            <div className="mt-4">
              {habilitationsQuery.isLoading ? (
                <LoadingBlock label="Chargement des habilitations..." />
              ) : habilitations.length === 0 ? (
                <p className="py-6 text-sm text-gray-500">
                  Aucune habilitation accordée pour ce dossier.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">Collaborateur</th>
                        <th className="py-2.5 px-3">Rôle Cabinet</th>
                        <th className="py-2.5 px-3">Niveau d'Accès Accordé</th>
                        <th className="py-2.5 px-3">Depuis le</th>
                        <th className="py-2.5 pr-3 text-right">Révocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {habilitations.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                            {h.collaborateur?.nomPrenoms}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {h.collaborateur?.role?.libelle}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                h.niveauAcces === "SIGNATURE"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                  : h.niveauAcces === "VALIDATION"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : h.niveauAcces === "ANNOTATION"
                                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {formatNiveauHabilitation(h.niveauAcces)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-400">
                            {new Date(h.dateDebut).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => deleteHabilitationMutation.mutate(h.id)}
                              className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                            >
                              Révoquer ✕
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
        </div>

        {/* MODAL NOUVEAU COLLABORATEUR */}
        {isCollabModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ajouter un collaborateur au cabinet
              </h3>

              <form onSubmit={handleCreateCollab} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Nom & Prénoms *
                  </label>
                  <input
                    type="text"
                    value={nomPrenoms}
                    onChange={(e) => setNomPrenoms(e.target.value)}
                    placeholder="Ex: Paul MENSAH"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Adresse Email professionnelle *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="p.mensah@cabinet-audit.com"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Rôle Interne *
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un rôle...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Numéro d'Ordre Professionnel (Optionnel pour experts)
                  </label>
                  <input
                    type="text"
                    value={numeroOrdre}
                    onChange={(e) => setNumeroOrdre(e.target.value)}
                    placeholder="Ex: OECCA-TG-042"
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCollabModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createCollaborateurMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {createCollaborateurMutation.isPending ? "Création..." : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL HABILITATION */}
        {isHabModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Habiliter un collaborateur sur ce dossier
              </h3>

              <form onSubmit={handleCreateHabilitation} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Collaborateur à habiliter *
                  </label>
                  <select
                    value={habCollabId}
                    onChange={(e) => setHabCollabId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un collaborateur...</option>
                    {collaborateurs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nomPrenoms} ({c.role?.libelle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Niveau d'Accès Accordé *
                  </label>
                  <select
                    value={niveauAcces}
                    onChange={(e) =>
                      setNiveauAcces(e.target.value as CabinetNiveauHabilitation)
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="CONSULTATION">
                      1. Consultation (Lecture seule sans annotation)
                    </option>
                    <option value="ANNOTATION">
                      2. Annotation (Points de revue & observations)
                    </option>
                    <option value="VALIDATION">
                      3. Validation (Visa des écritures & livrables)
                    </option>
                    <option value="SIGNATURE">
                      4. Signature (Signature certifiée & engagement cabinet)
                    </option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHabModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createHabilitationMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {createHabilitationMutation.isPending ? "Attribution..." : "Habiliter"}
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
