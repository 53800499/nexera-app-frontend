"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaClasse,
  ComptaCompte,
  ComptaCompteAuxiliaire,
} from "../types/comptabilite.types";
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  UserGroupIcon,
  PowerIcon,
} from "./ComptaIcons";

const CLASSES_SYSCOHADA = [
  { classe: 1, libelle: "Classe 1 — Ressources Stables & Capitaux" },
  { classe: 2, libelle: "Classe 2 — Actif Immobilisé" },
  { classe: 3, libelle: "Classe 3 — Stocks & En-cours" },
  { classe: 4, libelle: "Classe 4 — Tiers (Créances & Dettes)" },
  { classe: 5, libelle: "Classe 5 — Trésorerie (Banque, Caisse)" },
  { classe: 6, libelle: "Classe 6 — Charges d'Exploitation" },
  { classe: 7, libelle: "Classe 7 — Produits d'Exploitation" },
  { classe: 8, libelle: "Classe 8 — Autres Charges & Produits (HAO)" },
  { classe: 9, libelle: "Classe 9 — Engagements & Analytique" },
];

export const PlanComptableView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const [comptes, setComptes] = useState<ComptaCompte[]>([]);
  const [classeActive, setClasseActive] = useState<number>(0); // 0 = Tous
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nouveau Compte
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumero, setNewNumero] = useState("");
  const [newIntitule, setNewIntitule] = useState("");
  const [newSens, setNewSens] = useState<"DEBITEUR" | "CREDITEUR" | "INDETERMINE">("DEBITEUR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Détail Compte
  const [detailCompte, setDetailCompte] = useState<ComptaCompte | null>(null);

  // Modal Modifier Compte
  const [editCompte, setEditCompte] = useState<ComptaCompte | null>(null);
  const [editIntitule, setEditIntitule] = useState("");
  const [editSens, setEditSens] = useState<"DEBITEUR" | "CREDITEUR" | "INDETERMINE">("DEBITEUR");
  const [isEditing, setIsEditing] = useState(false);

  // Drawer Auxiliaires
  const [selectedCompte, setSelectedCompte] = useState<ComptaCompte | null>(null);
  const [auxiliaires, setAuxiliaires] = useState<ComptaCompteAuxiliaire[]>([]);
  const [showAuxModal, setShowAuxModal] = useState(false);
  const [newAuxCode, setNewAuxCode] = useState("");
  const [newAuxIntitule, setNewAuxIntitule] = useState("");
  const [newAuxType, setNewAuxType] = useState<"CLIENT" | "FOURNISSEUR" | "SALARIE" | "AUTRE">("CLIENT");

  useEffect(() => {
    chargerComptes();
  }, [classeActive]);

  const chargerComptes = async () => {
    setIsLoading(true);
    try {
      const data = await comptabiliteApi.getPlanComptable({
        classe: classeActive > 0 ? classeActive : undefined,
      });
      setComptes(data);
    } catch (err) {
      console.error("Erreur chargement plan comptable:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrerComptes = () => {
    return comptes.filter((c) => {
      const matchSearch =
        c.numero.toLowerCase().includes(search.toLowerCase()) ||
        c.intitule.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  };

  const handleToggleActif = async (c: ComptaCompte) => {
    const actionLabel = c.actif ? "désactiver" : "activer";
    const confirmed = await confirm({
      title: `${c.actif ? "Désactiver" : "Activer"} le compte`,
      message: `Voulez-vous vraiment ${actionLabel} le compte ${c.numero} - ${c.intitule} ?`,
      confirmLabel: c.actif ? "Désactiver" : "Activer",
      cancelLabel: "Annuler",
      variant: c.actif ? "warning" : "default",
    });
    if (!confirmed) return;

    try {
      await comptabiliteApi.toggleActifCompte(c.id);
      setComptes((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, actif: !item.actif } : item)),
      );
      showResult({
        variant: "success",
        title: "Statut mis à jour",
        message: `Le compte ${c.numero} est désormais ${!c.actif ? "actif" : "inactif"}.`,
      });
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur modification statut",
        message: err.message || "Erreur lors du basculement d'activation.",
      });
    }
  };

  const handleCreateCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumero || !newIntitule) return;
    setIsSubmitting(true);
    try {
      const classe = parseInt(newNumero.charAt(0), 10) as ComptaClasse;
      await comptabiliteApi.createCompte({
        numero: newNumero,
        intitule: newIntitule,
        classe,
        sensAttendu: newSens,
        actif: true,
      });
      setShowAddModal(false);
      const numCree = newNumero;
      const intCree = newIntitule;
      setNewNumero("");
      setNewIntitule("");
      showResult({
        variant: "success",
        title: "Compte créé",
        message: `Le compte ${numCree} - ${intCree} a été créé avec succès.`,
      });
      chargerComptes();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur création compte",
        message: err.message || "Erreur lors de la création du compte.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (c: ComptaCompte) => {
    setEditCompte(c);
    setEditIntitule(c.intitule);
    setEditSens(c.sensAttendu);
  };

  const handleUpdateCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompte || !editIntitule.trim()) return;
    setIsEditing(true);
    try {
      await comptabiliteApi.updateCompte(editCompte.id, {
        intitule: editIntitule.trim(),
        sensAttendu: editSens,
      });
      setEditCompte(null);
      showResult({
        variant: "success",
        title: "Compte modifié",
        message: "Les modifications du compte comptable ont été enregistrées.",
      });
      chargerComptes();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur modification compte",
        message: err.message || "Erreur lors de la modification du compte.",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const openAuxiliaires = async (compte: ComptaCompte) => {
    setSelectedCompte(compte);
    try {
      const auxs = await comptabiliteApi.getComptesAuxiliaires(compte.id);
      setAuxiliaires(auxs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAuxiliaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompte || !newAuxCode || !newAuxIntitule) return;
    try {
      await comptabiliteApi.createCompteAuxiliaire({
        compteCollectifId: selectedCompte.id,
        codeAuxiliaire: newAuxCode.toUpperCase(),
        intitule: newAuxIntitule,
        typeTiers: newAuxType,
      });
      setShowAuxModal(false);
      const code = newAuxCode.toUpperCase();
      setNewAuxCode("");
      setNewAuxIntitule("");
      openAuxiliaires(selectedCompte);
      showResult({
        variant: "success",
        title: "Tiers auxiliaire créé",
        message: `Le compte auxiliaire ${code} a été rattaché avec succès.`,
      });
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur création tiers",
        message: err.message || "Erreur lors de la création du compte auxiliaire.",
      });
    }
  };

  const comptesFiltres = filtrerComptes();

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Plan Comptable SYSCOHADA
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Nomenclature officielle OHADA révisée — 9 classes de comptes et comptes auxiliaires tiers (classe 4).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Créer un Compte
          </button>
        </div>
      </div>

      {/* Classes Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setClasseActive(0)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            classeActive === 0
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          Tous ({comptes.length})
        </button>
        {CLASSES_SYSCOHADA.map((cl) => (
          <button
            key={cl.classe}
            onClick={() => setClasseActive(cl.classe)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              classeActive === cl.classe
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Cl. {cl.classe}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par numéro de compte ou intitulé (ex: 411, Fournisseurs, Banque, 701)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <th className="py-3 px-4">Numéro</th>
              <th className="py-3 px-4">Intitulé SYSCOHADA</th>
              <th className="py-3 px-4">Classe</th>
              <th className="py-3 px-4">Sens Attendu</th>
              <th className="py-3 px-4">Auxiliaires</th>
              <th className="py-3 px-4 text-center">Mouvementé</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </td>
              </tr>
            ) : comptesFiltres.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Aucun compte ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              comptesFiltres.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/75 transition dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                    {c.numero}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                    {c.intitule}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      Classe {c.classe}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span
                      className={`font-semibold ${
                        c.sensAttendu === "DEBITEUR"
                          ? "text-blue-600 dark:text-blue-400"
                          : c.sensAttendu === "CREDITEUR"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-500"
                      }`}
                    >
                      {c.sensAttendu}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.classe === 4 ? (
                      <button
                        onClick={() => openAuxiliaires(c)}
                        className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                      >
                        Gérer tiers
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.mouvemente ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Compte avec écritures" />
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" title="Non mouvementé" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        c.actif
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {c.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailCompte(c)}
                        title="Consulter le détail du compte"
                        aria-label="Détail"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        title="Modifier l'intitulé du compte"
                        aria-label="Modifier"
                        className="inline-flex items-center justify-center rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40 transition shadow-xs"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      {c.classe === 4 && (
                        <button
                          type="button"
                          onClick={() => openAuxiliaires(c)}
                          title="Gérer les comptes tiers auxiliaires"
                          aria-label="Tiers"
                          className="inline-flex items-center justify-center rounded-lg border border-indigo-200 p-1.5 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition shadow-xs"
                        >
                          <UserGroupIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleActif(c)}
                        title={c.actif ? "Désactiver ce compte" : "Activer ce compte"}
                        aria-label={c.actif ? "Désactiver" : "Activer"}
                        className={`inline-flex items-center justify-center rounded-lg border p-1.5 transition shadow-xs ${
                          c.actif
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        <PowerIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Créer un Compte */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Ajouter un Compte Personnalisé
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Conformément à l'AUDCIF, le compte doit respecter la racine de sa classe.
            </p>

            <form onSubmit={handleCreateCompte} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Numéro de compte (ex: 411100, 601100)
                </label>
                <input
                  type="text"
                  required
                  value={newNumero}
                  onChange={(e) => setNewNumero(e.target.value)}
                  placeholder="Ex: 411100"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Intitulé du compte
                </label>
                <input
                  type="text"
                  required
                  value={newIntitule}
                  onChange={(e) => setNewIntitule(e.target.value)}
                  placeholder="Ex: Clients zone UEMOA"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Sens attendu
                </label>
                <select
                  value={newSens}
                  onChange={(e: any) => setNewSens(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="DEBITEUR">Débiteur (Actif / Charges)</option>
                  <option value="CREDITEUR">Créditeur (Passif / Produits)</option>
                  <option value="INDETERMINE">Indéterminé (Mixte)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
                >
                  {isSubmitting ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détail Compte */}
      {detailCompte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  COMPTE {detailCompte.numero}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {detailCompte.intitule}
                </h2>
              </div>
              <button
                onClick={() => setDetailCompte(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Classe Comptable</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  Classe {detailCompte.classe}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Sens Attendu</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {detailCompte.sensAttendu}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Statut du Compte</span>
                <p className="mt-1 font-semibold">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] ${
                      detailCompte.actif
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {detailCompte.actif ? "Actif" : "Inactif"}
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Mouvements Enregistrés</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {detailCompte.mouvemente ? "Oui (écritures existantes)" : "Aucune écriture"}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Conformité AUDCIF / SYSCOHADA</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {detailCompte.estRacineSyscohada
                    ? "Compte officiel racine du plan comptable général OHADA révisé."
                    : "Sous-compte divisionnaire personnalisé créé pour les besoins de l'entreprise."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = detailCompte;
                    setDetailCompte(null);
                    openEditModal(c);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-400"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Modifier
                </button>
                {detailCompte.classe === 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = detailCompte;
                      setDetailCompte(null);
                      openAuxiliaires(c);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
                  >
                    <UserGroupIcon className="w-3.5 h-3.5" />
                    Gérer Tiers
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await handleToggleActif(detailCompte);
                    setDetailCompte((prev) => prev ? { ...prev, actif: !prev.actif } : null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  <PowerIcon className="w-3.5 h-3.5" />
                  {detailCompte.actif ? "Désactiver" : "Activer"}
                </button>
              </div>
              <button
                onClick={() => setDetailCompte(null)}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Compte */}
      {editCompte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Modifier le Compte : {editCompte.numero}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Mise à jour de l'intitulé et des règles de fonctionnement SYSCOHADA.
            </p>

            <form onSubmit={handleUpdateCompte} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Numéro de compte (Non modifiable)
                </label>
                <input
                  type="text"
                  disabled
                  value={editCompte.numero}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 p-2.5 font-mono text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Intitulé du compte
                </label>
                <input
                  type="text"
                  required
                  value={editIntitule}
                  onChange={(e) => setEditIntitule(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Sens attendu
                </label>
                <select
                  value={editSens}
                  onChange={(e: any) => setEditSens(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="DEBITEUR">Débiteur (Actif / Charges)</option>
                  <option value="CREDITEUR">Créditeur (Passif / Produits)</option>
                  <option value="INDETERMINE">Indéterminé (Mixte)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditCompte(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
                >
                  {isEditing ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal Comptes Auxiliaires (Tiers) */}
      {selectedCompte && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl overflow-y-auto dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Comptes Auxiliaires : {selectedCompte.numero}
                </h2>
                <p className="text-xs text-gray-500">{selectedCompte.intitule}</p>
              </div>
              <button
                onClick={() => setSelectedCompte(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {auxiliaires.length} tiers rattachés
              </span>
              <button
                onClick={() => setShowAuxModal(true)}
                className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Nouveau Tiers
              </button>
            </div>

            {/* Formulaire ajout rapide tiers */}
            {showAuxModal && (
              <form onSubmit={handleCreateAuxiliaire} className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                <h3 className="text-xs font-bold text-blue-950 dark:text-blue-300">
                  Ajouter un compte auxiliaire (alphanumérique jusqu'à 13 car.)
                </h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Code Auxiliaire (ex: CL001, FO-TOTAL)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuxCode}
                      onChange={(e) => setNewAuxCode(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 p-2 text-xs uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Raison Sociale / Nom
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuxIntitule}
                      onChange={(e) => setNewAuxIntitule(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Type de tiers
                    </label>
                    <select
                      value={newAuxType}
                      onChange={(e: any) => setNewAuxType(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="FOURNISSEUR">Fournisseur</option>
                      <option value="SALARIE">Salarié</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAuxModal(false)}
                      className="rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Liste des auxiliaires */}
            <div className="mt-4 space-y-2">
              {auxiliaires.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">
                  Aucun compte auxiliaire pour le moment.
                </p>
              ) : (
                auxiliaires.map((aux) => (
                  <div
                    key={aux.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {aux.codeAuxiliaire}
                      </span>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {aux.intitule}
                      </p>
                    </div>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {aux.typeTiers}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
