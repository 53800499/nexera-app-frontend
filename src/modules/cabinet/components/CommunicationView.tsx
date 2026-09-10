"use client";

import React, { useState } from "react";
import { useCommunication } from "../hooks/useCommunication";
import { usePortefeuille } from "../hooks/usePortefeuille";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type { CabinetStatutDemandePiece } from "../types/cabinet.types";

export function CommunicationView() {
  const [activeTab, setActiveTab] = useState<"demandes" | "messages" | "documents">(
    "demandes",
  );
  const [selectedMandatId, setSelectedMandatId] = useState("");

  const {
    demandesQuery,
    messagesQuery,
    documentsQuery,
    createDemandeMutation,
    relancerDemandeMutation,
    sendMessageMutation,
    addDocumentMutation,
  } = useCommunication(selectedMandatId || undefined);

  const { mandatsQuery } = usePortefeuille();

  const [isDemandeModalOpen, setIsDemandeModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Demande form
  const [demandeLibelle, setDemandeLibelle] = useState("");
  const [dateLimite, setDateLimite] = useState("");

  // Message form
  const [messageContent, setMessageContent] = useState("");

  // Document form
  const [docLibelle, setDocLibelle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const demandes = demandesQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const mandats = mandatsQuery.data ?? [];

  const handleCreateDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandatId || !demandeLibelle) return;

    await createDemandeMutation.mutateAsync({
      cabinetClientMandatId: selectedMandatId,
      libelle: demandeLibelle,
      dateLimiteReponse: dateLimite || undefined,
    });

    setIsDemandeModalOpen(false);
    setDemandeLibelle("");
    setDateLimite("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandatId || !messageContent.trim()) return;

    await sendMessageMutation.mutateAsync({
      cabinetClientMandatId: selectedMandatId,
      contenu: messageContent,
    });

    setMessageContent("");
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandatId || !docLibelle || !docUrl) return;

    await addDocumentMutation.mutateAsync({
      cabinetClientMandatId: selectedMandatId,
      libelle: docLibelle,
      fichierUrl: docUrl,
    });

    setIsDocModalOpen(false);
    setDocLibelle("");
    setDocUrl("");
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Demandes de Pièces & Échanges Clients
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Collecte dématérialisée, relances automatiques et coffre-fort de documents partagés
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDemandeModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
            >
              + Demander une Pièce
            </button>
            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              📁 Déposer un Document
            </button>
          </div>
        </div>

        {/* SÉLECTEUR DE MANDAT */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Filtrer par Dossier Client Mandat
          </label>
          <select
            value={selectedMandatId}
            onChange={(e) => setSelectedMandatId(e.target.value)}
            className="mt-1 block w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tous les dossiers mandats...</option>
            {mandats.map((m) => (
              <option key={m.id} value={m.id}>
                {m.typeMandat} (#{m.clientTenantId.slice(0, 8)})
              </option>
            ))}
          </select>
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("demandes")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "demandes"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Demandes de Justificatifs ({demandes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "messages"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Fil de Discussion ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === "documents"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents Partagés ({documents.length})
          </button>
        </div>

        {activeTab === "demandes" ? (
          <div>
            {demandesQuery.isLoading ? (
              <LoadingBlock label="Chargement des demandes..." />
            ) : demandes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucune demande de pièce en attente.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                    <tr>
                      <th className="py-3.5 px-4">Date Demande</th>
                      <th className="py-3.5 px-4">Pièce Requise</th>
                      <th className="py-3.5 px-4">Dossier</th>
                      <th className="py-3.5 px-4">Date Limite</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 pr-4 text-right">Relance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {demandes.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="py-3.5 px-4 text-gray-500">
                          {new Date(d.dateDemande).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {d.libelle}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {d.mandat?.typeMandat} (#{d.mandat?.clientTenantId.slice(0, 8)})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {d.dateLimiteReponse
                            ? new Date(d.dateLimiteReponse).toLocaleDateString("fr-FR")
                            : "Non définie"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              d.statut === "RECUE"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : d.statut === "RELANCEE"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {d.statut}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          {d.statut !== "RECUE" && (
                            <button
                              type="button"
                              onClick={() => relancerDemandeMutation.mutate(d.id)}
                              disabled={relancerDemandeMutation.isPending}
                              className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200"
                            >
                              🔔 Relancer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "messages" ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {!selectedMandatId ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Veuillez sélectionner un mandat client ci-dessus pour ouvrir le fil de discussion.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  {messages.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-400">
                      Aucun message dans ce fil. Démarrez la conversation !
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.auteurType === "COLLABORATEUR_CABINET"
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-md rounded-xl p-3 text-xs shadow-xs ${
                            m.auteurType === "COLLABORATEUR_CABINET"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                          }`}
                        >
                          <p className="font-semibold text-[10px] opacity-80">
                            {m.auteurNom || "Cabinet"}
                          </p>
                          <p className="mt-1">{m.contenu}</p>
                          <p className="mt-1 text-[9px] opacity-60 text-right">
                            {new Date(m.dateEnvoi).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Écrivez votre message au client..."
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending || !messageContent.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!selectedMandatId ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Sélectionnez un mandat pour explorer son coffre-fort de documents.
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Aucun document partagé sur ce mandat.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900"
                  >
                    <span className="text-2xl">📄</span>
                    <h4 className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                      {doc.libelle}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      Déposé par {doc.deposeParNom} le {new Date(doc.dateDepot).toLocaleDateString("fr-FR")}
                    </p>
                    <a
                      href={doc.fichierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Télécharger / Consulter ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DEMANDE PIÈCE */}
        {isDemandeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Demander une pièce justificative au client
              </h3>

              <form onSubmit={handleCreateDemande} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat Client *
                  </label>
                  <select
                    value={selectedMandatId}
                    onChange={(e) => setSelectedMandatId(e.target.value)}
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
                    Libellé de la pièce attendue *
                  </label>
                  <input
                    type="text"
                    value={demandeLibelle}
                    onChange={(e) => setDemandeLibelle(e.target.value)}
                    placeholder="Ex: Relevés bancaires BOA Décembre 2025"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date limite de réponse
                  </label>
                  <input
                    type="date"
                    value={dateLimite}
                    onChange={(e) => setDateLimite(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDemandeModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createDemandeMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createDemandeMutation.isPending ? "Envoi..." : "Envoyer la Demande"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DÉPÔT DOCUMENT */}
        {isDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Déposer un document partagé
              </h3>

              <form onSubmit={handleAddDocument} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mandat Client *
                  </label>
                  <select
                    value={selectedMandatId}
                    onChange={(e) => setSelectedMandatId(e.target.value)}
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
                    Titre du document *
                  </label>
                  <input
                    type="text"
                    value={docLibelle}
                    onChange={(e) => setDocLibelle(e.target.value)}
                    placeholder="Ex: Rapport d'audit intermédiaire 2025"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    URL du fichier / Document *
                  </label>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://storage.nexera.app/..."
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDocModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={addDocumentMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {addDocumentMutation.isPending ? "Dépôt..." : "Déposer le Document"}
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
