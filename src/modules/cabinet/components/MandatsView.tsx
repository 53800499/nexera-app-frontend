"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { useCollaborateurs } from "../hooks/useCollaborateurs";
import { useLinkedCompanies } from "../hooks/useLinkedCompanies";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetTypeMandat } from "../types/cabinet.types";

export function MandatsView() {
  const { mandatsQuery, createMandatMutation } = usePortefeuille();
  const { collaborateursQuery } = useCollaborateurs();
  const { companiesQuery } = useLinkedCompanies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [typeMandat, setTypeMandat] = useState<CabinetTypeMandat>("TENUE_COMPTABLE");
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState("");
  const [responsableId, setResponsableId] = useState("");

  const mandats = mandatsQuery.data ?? [];
  const collaborateurs = collaborateursQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const handleCreateMandat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    await createMandatMutation.mutateAsync({
      clientTenantId: selectedCompanyId,
      typeMandat,
      dateDebut,
      dateFin: dateFin || undefined,
      collaborateurResponsableId: responsableId || undefined,
    });

    setIsModalOpen(false);
    setSelectedCompanyId("");
    setDateFin("");
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portefeuille & Mandats Clients
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Relations contractuelles, lettres de mission et interlocuteurs par dossier
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
          >
            + Formaliser un Mandat
          </button>
        </div>

        {mandatsQuery.isLoading ? (
          <LoadingBlock label="Chargement des mandats..." />
        ) : mandatsQuery.isError ? (
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de charger le portefeuille de mandats."
          />
        ) : mandats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Aucun mandat actif enregistré. Cliquez sur "+ Formaliser un Mandat" pour démarrer.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="py-3.5 px-4">Client & Dossier</th>
                  <th className="py-3.5 px-4">Type de Mandat</th>
                  <th className="py-3.5 px-4">Responsable Cabinet</th>
                  <th className="py-3.5 px-4">Période</th>
                  <th className="py-3.5 px-4">Missions</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {mandats.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Dossier #{m.clientTenantId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.contactsClient?.length ? `${m.contactsClient.length} contact(s)` : "Aucun contact renseigné"}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {m.typeMandat.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {m.collaborateurResponsable?.nomPrenoms || (
                        <span className="text-xs text-amber-600">À désigner</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      Du {new Date(m.dateDebut).toLocaleDateString("fr-FR")}
                      {m.dateFin ? ` au ${new Date(m.dateFin).toLocaleDateString("fr-FR")}` : " (Indéterminée)"}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {m._count?.missions ?? 0} mission(s)
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {m.statut}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <Link
                        href={`/cabinet/dossiers/${m.clientTenantId}`}
                        className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
                      >
                        Ouvrir Dossier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL CRÉATION MANDAT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Formaliser un nouveau mandat client
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Crée la relation contractuelle entre le cabinet et l'entreprise cliente.
              </p>

              <form onSubmit={handleCreateMandat} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Entreprise Cliente (Dossier) *
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez une entreprise liée...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type de Mandat *
                  </label>
                  <select
                    value={typeMandat}
                    onChange={(e) => setTypeMandat(e.target.value as CabinetTypeMandat)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="TENUE_COMPTABLE">Tenue comptable mensuelle SYSCOHADA</option>
                    <option value="REVISION_ANNUELLE">Révision annuelle des comptes</option>
                    <option value="EXPERTISE_PAIE">Expertise sociale & Paie</option>
                    <option value="ASSISTANCE_FISCALE">Assistance & Déclarations fiscales</option>
                    <option value="AUDIT_CONTRACTUEL">Audit contractuel</option>
                    <option value="MISSION_PONCTUELLE">Mission ponctuelle de conseil</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date de Début *
                    </label>
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Date de Fin (Optionnelle)
                    </label>
                    <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Collaborateur Responsable du Dossier
                  </label>
                  <select
                    value={responsableId}
                    onChange={(e) => setResponsableId(e.target.value)}
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

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMandatMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMandatMutation.isPending ? "Création..." : "Créer le Mandat"}
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
