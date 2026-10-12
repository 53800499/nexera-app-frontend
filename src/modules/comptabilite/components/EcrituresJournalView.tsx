"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaCompte,
  ComptaEcriture,
  ComptaExercice,
  ComptaJournal,
  ComptaPeriode,
} from "../types/comptabilite.types";
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
} from "./ComptaIcons";

interface NouvelleLigne {
  compteId: string;
  compteNumero: string;
  compteIntitule: string;
  compteAuxiliaireId?: string | null;
  libelleLigne: string;
  montantDebit: number;
  montantCredit: number;
}

export const EcrituresJournalView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const [ecritures, setEcritures] = useState<ComptaEcriture[]>([]);
  const [journaux, setJournaux] = useState<ComptaJournal[]>([]);
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [comptes, setComptes] = useState<ComptaCompte[]>([]);

  const [selectedJournal, setSelectedJournal] = useState<string>("");
  const [selectedExercice, setSelectedExercice] = useState<string>("");
  const [selectedStatut, setSelectedStatut] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal Saisie
  const [showModal, setShowModal] = useState(false);
  const [journalId, setJournalId] = useState("");
  const [exerciceId, setExerciceId] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const [dateEcriture, setDateEcriture] = useState(new Date().toISOString().substring(0, 10));
  const [libelle, setLibelle] = useState("");
  const [pieceRef, setPieceRef] = useState("");
  const [lignes, setLignes] = useState<NouvelleLigne[]>([
    { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: "", montantDebit: 0, montantCredit: 0 },
    { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: "", montantDebit: 0, montantCredit: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Détail Écriture
  const [detailEcriture, setDetailEcriture] = useState<ComptaEcriture | null>(null);

  // Modal Modifier Écriture (pour statuts BROUILLON et REJETEE)
  const [editEcriture, setEditEcriture] = useState<ComptaEcriture | null>(null);
  const [editDateEcriture, setEditDateEcriture] = useState("");
  const [editLibelle, setEditLibelle] = useState("");
  const [editPieceRef, setEditPieceRef] = useState("");
  const [editLignes, setEditLignes] = useState<NouvelleLigne[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    initialiser();
  }, []);

  useEffect(() => {
    chargerEcritures();
  }, [selectedJournal, selectedExercice, selectedStatut]);

  const initialiser = async () => {
    try {
      const [jRes, eRes, cRes] = await Promise.allSettled([
        comptabiliteApi.getJournaux(),
        comptabiliteApi.getExercices(),
        comptabiliteApi.getPlanComptable({ actif: true }),
      ]);
      const jList = jRes.status === "fulfilled" ? jRes.value : [];
      const eList = eRes.status === "fulfilled" ? eRes.value : [];
      const cList = cRes.status === "fulfilled" ? cRes.value : [];

      setJournaux(jList);
      setExercices(eList);
      setComptes(cList);

      const exActif = eList.find((e) => e.statut === "OUVERT") || eList[0];
      if (exActif) {
        setSelectedExercice(exActif.id);
        setExerciceId(exActif.id);
        if (exActif.periodes && exActif.periodes.length > 0) {
          setPeriodeId(exActif.periodes[0].id);
        }
      }
      if (jList.length > 0) {
        setJournalId(jList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const chargerEcritures = async () => {
    setIsLoading(true);
    try {
      const data = await comptabiliteApi.getEcritures({
        journalId: selectedJournal || undefined,
        exerciceId: selectedExercice || undefined,
        statut: selectedStatut || undefined,
      });
      setEcritures(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul totaux saisie en cours
  const totDebit = lignes.reduce((sum, l) => sum + (Number(l.montantDebit) || 0), 0);
  const totCredit = lignes.reduce((sum, l) => sum + (Number(l.montantCredit) || 0), 0);
  const ecart = Math.abs(totDebit - totCredit);
  const estEquilibree = ecart < 0.01 && totDebit > 0;

  const handleCompteChange = (index: number, compteId: string) => {
    const c = comptes.find((item) => item.id === compteId);
    setLignes((prev) => {
      const copy = [...prev];
      copy[index].compteId = compteId;
      copy[index].compteNumero = c?.numero || "";
      copy[index].compteIntitule = c?.intitule || "";
      return copy;
    });
  };

  const ajouterLigne = () => {
    setLignes((prev) => [
      ...prev,
      { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: libelle, montantDebit: 0, montantCredit: 0 },
    ]);
  };

  const supprimerLigne = (index: number) => {
    if (lignes.length <= 2) {
      showResult({
        variant: "error",
        title: "Intégrité comptable (EF-012)",
        message: "Une écriture comptable doit comporter au moins 2 lignes.",
      });
      return;
    }
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (soumettreDirectement = false) => {
    // 1. Filtrer les lignes vides (non renseignées : ni compte ni montant)
    const lignesNonVides = lignes.filter(
      (l) =>
        (l.compteId && l.compteId.trim().length > 0) ||
        Number(l.montantDebit || 0) > 0 ||
        Number(l.montantCredit || 0) > 0
    );

    // 2. Vérifier que chaque ligne renseignée possède un compte sélectionné
    const ligneSansCompte = lignesNonVides.find((l) => !l.compteId || !l.compteId.trim());
    if (ligneSansCompte) {
      showResult({
        variant: "error",
        title: "Compte manquant",
        message: "Veuillez sélectionner un compte pour chaque ligne de l'écriture ayant un montant.",
      });
      return;
    }

    if (lignesNonVides.length < 2) {
      showResult({
        variant: "error",
        title: "Intégrité comptable (EF-012)",
        message: "Une écriture comptable doit comporter au moins 2 lignes renseignées avec un compte valide.",
      });
      return;
    }

    const totalDeb = lignesNonVides.reduce((sum, l) => sum + (Number(l.montantDebit) || 0), 0);
    const totalCred = lignesNonVides.reduce((sum, l) => sum + (Number(l.montantCredit) || 0), 0);
    const ecart = Math.abs(totalDeb - totalCred);

    if (ecart > 0.01 || totalDeb <= 0) {
      showResult({
        variant: "error",
        title: "Écriture non équilibrée (EF-011)",
        message: `L'écriture doit être strictement équilibrée (Total Débit: ${totalDeb.toFixed(2)} = Total Crédit: ${totalCred.toFixed(2)}).`,
      });
      return;
    }

    if (!libelle.trim()) {
      showResult({
        variant: "error",
        title: "Champ requis",
        message: "Le libellé de l'écriture est obligatoire.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        exerciceId: exerciceId || undefined,
        periodeId: periodeId || undefined,
        journalId,
        dateEcriture,
        libelle: libelle.trim(),
        pieceRef: pieceRef.trim() || undefined,
        refPiece: pieceRef.trim() || undefined,
        datePiece: dateEcriture,
        lignes: lignesNonVides.map((l, idx) => ({
          ordre: idx + 1,
          compteId: l.compteId,
          compteAuxiliaireId: l.compteAuxiliaireId || undefined,
          libelleLigne: l.libelleLigne?.trim() || libelle.trim(),
          montantDebit: Number(l.montantDebit) || 0,
          montantCredit: Number(l.montantCredit) || 0,
        })),
      };

      const res = await comptabiliteApi.createEcriture(payload);

      if (soumettreDirectement) {
        await comptabiliteApi.soumettreValidation(res.id);
      }

      setShowModal(false);
      resetForm();
      showResult({
        variant: "success",
        title: soumettreDirectement ? "Écriture soumise" : "Brouillon enregistré",
        message: soumettreDirectement
          ? "L'écriture a été enregistrée et transmise au workflow de validation (EF-008)."
          : "L'écriture comptable a été enregistrée avec succès en brouillon.",
      });
      chargerEcritures();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur enregistrement",
        message: err.message || "Erreur lors de l'enregistrement de l'écriture.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLibelle("");
    setPieceRef("");
    setLignes([
      { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: "", montantDebit: 0, montantCredit: 0 },
      { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: "", montantDebit: 0, montantCredit: 0 },
    ]);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const openEdit = (e: ComptaEcriture) => {
    setEditEcriture(e);
    setEditDateEcriture(e.dateEcriture ? e.dateEcriture.substring(0, 10) : "");
    setEditLibelle(e.libelle || "");
    setEditPieceRef(e.pieceRef || "");
    setEditLignes(
      (e.lignes || []).map((l) => ({
        compteId: l.compteId,
        compteNumero: l.compte?.numero || (l as any).compteNumero || "",
        compteIntitule: l.compte?.intitule || (l as any).compteIntitule || "",
        compteAuxiliaireId: l.compteAuxiliaireId,
        libelleLigne: l.libelleLigne || e.libelle,
        montantDebit: Number(l.montantDebit) || 0,
        montantCredit: Number(l.montantCredit) || 0,
      }))
    );
  };

  const handleCompteChangeEdit = (index: number, compteId: string) => {
    const c = comptes.find((item) => item.id === compteId);
    setEditLignes((prev) => {
      const copy = [...prev];
      copy[index].compteId = compteId;
      copy[index].compteNumero = c?.numero || "";
      copy[index].compteIntitule = c?.intitule || "";
      return copy;
    });
  };

  const ajouterLigneEdit = () => {
    setEditLignes((prev) => [
      ...prev,
      { compteId: "", compteNumero: "", compteIntitule: "", libelleLigne: editLibelle, montantDebit: 0, montantCredit: 0 },
    ]);
  };

  const supprimerLigneEdit = (index: number) => {
    if (editLignes.length <= 2) {
      showResult({
        variant: "error",
        title: "Intégrité comptable (EF-012)",
        message: "Une écriture comptable doit comporter au moins 2 lignes.",
      });
      return;
    }
    setEditLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEcriture = async (soumettreDirectement = false) => {
    if (!editEcriture) return;

    // 1. Filtrer les lignes vides (non renseignées : ni compte ni montant)
    const lignesNonVides = editLignes.filter(
      (l) =>
        (l.compteId && l.compteId.trim().length > 0) ||
        Number(l.montantDebit || 0) > 0 ||
        Number(l.montantCredit || 0) > 0
    );

    // 2. Vérifier que chaque ligne renseignée possède un compte sélectionné
    const ligneSansCompte = lignesNonVides.find((l) => !l.compteId || !l.compteId.trim());
    if (ligneSansCompte) {
      showResult({
        variant: "error",
        title: "Compte manquant",
        message: "Veuillez sélectionner un compte pour chaque ligne de l'écriture ayant un montant.",
      });
      return;
    }

    if (lignesNonVides.length < 2) {
      showResult({
        variant: "error",
        title: "Intégrité comptable (EF-012)",
        message: "Une écriture comptable doit comporter au moins 2 lignes renseignées avec un compte valide.",
      });
      return;
    }

    const totDeb = lignesNonVides.reduce((s, l) => s + (Number(l.montantDebit) || 0), 0);
    const totCred = lignesNonVides.reduce((s, l) => s + (Number(l.montantCredit) || 0), 0);
    const ecart = Math.abs(totDeb - totCred);

    if (ecart > 0.01 || totDeb <= 0) {
      showResult({
        variant: "error",
        title: "Écriture non équilibrée (EF-011)",
        message: `L'écriture doit être équilibrée (Total Débit: ${totDeb.toFixed(2)} = Total Crédit: ${totCred.toFixed(2)}).`,
      });
      return;
    }

    if (!editLibelle.trim()) {
      showResult({
        variant: "error",
        title: "Champ requis",
        message: "Le libellé de l'écriture est obligatoire.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await comptabiliteApi.updateEcriture(editEcriture.id, {
        dateEcriture: editDateEcriture,
        libelle: editLibelle.trim(),
        pieceRef: editPieceRef.trim() || undefined,
        refPiece: editPieceRef.trim() || undefined,
        lignes: lignesNonVides.map((l, idx) => ({
          ordre: idx + 1,
          compteId: l.compteId,
          compteAuxiliaireId: l.compteAuxiliaireId || undefined,
          libelleLigne: l.libelleLigne?.trim() || editLibelle.trim(),
          montantDebit: Number(l.montantDebit) || 0,
          montantCredit: Number(l.montantCredit) || 0,
        })),
      });

      if (soumettreDirectement) {
        await comptabiliteApi.soumettreValidation(editEcriture.id);
      }

      setEditEcriture(null);
      showResult({
        variant: "success",
        title: "Écriture mise à jour",
        message: soumettreDirectement
          ? "L'écriture a été modifiée et soumise au workflow de validation."
          : "L'écriture comptable a été mise à jour avec succès.",
      });
      chargerEcritures();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur modification",
        message: err.message || "Erreur lors de la modification de l'écriture.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEcriture = async (e: ComptaEcriture) => {
    const confirmed = await confirm({
      title: "Supprimer l'écriture",
      message: `Confirmez-vous la suppression définitive de cette écriture "${e.pieceRef || e.libelle}" (${e.statut}) ? Cette action est irréversible.`,
      confirmLabel: "Supprimer définitivement",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await comptabiliteApi.deleteEcriture(e.id);
      showResult({
        variant: "success",
        title: "Écriture supprimée",
        message: "L'écriture a été supprimée avec succès.",
      });
      chargerEcritures();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur suppression",
        message: err.message || "Erreur lors de la suppression de l'écriture.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Journaux & Saisie d'Écritures
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Saisie manuelle multi-lignes, contrôle strict d'équilibre Débit/Crédit et traçabilité par journal.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
        >
          <PlusIcon className="w-4 h-4" />
          Saisir une Écriture
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Journal
          </label>
          <select
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tous les journaux</option>
            {journaux.map((j) => (
              <option key={j.id} value={j.id}>
                {j.codeJournal} — {j.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Exercice
          </label>
          <select
            value={selectedExercice}
            onChange={(e) => setSelectedExercice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {exercices.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.annee} ({ex.statut})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Statut
          </label>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EN_ATTENTE_VALIDATION">En attente de validation</option>
            <option value="VALIDEE">Validée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={chargerEcritures}
            className="w-full rounded-lg bg-gray-100 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">N° Écriture</th>
              <th className="py-3 px-4">Journal</th>
              <th className="py-3 px-4">Pièce Réf</th>
              <th className="py-3 px-4">Libellé</th>
              <th className="py-3 px-4 text-right">Débit</th>
              <th className="py-3 px-4 text-right">Crédit</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </td>
              </tr>
            ) : ecritures.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-gray-400">
                  Aucune écriture trouvée pour ces critères.
                </td>
              </tr>
            ) : (
              ecritures.map((e) => {
                const totalDeb = e.lignes.reduce((s, l) => s + Number(l.montantDebit || 0), 0);
                const totalCred = e.lignes.reduce((s, l) => s + Number(l.montantCredit || 0), 0);

                return (
                  <tr key={e.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {new Date(e.dateEcriture).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {e.numEcriture || "BROUILLON"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {e.journal?.codeJournal || "OD"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">
                      {e.pieceRef || "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {e.libelle}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {formatCurrency(totalDeb)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {formatCurrency(totalCred)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          e.statut === "VALIDEE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : e.statut === "EN_ATTENTE_VALIDATION"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : e.statut === "REJETEE"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {e.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailEcriture(e)}
                          title="Consulter le détail de l'écriture"
                          aria-label="Détail"
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </button>
                        {(e.statut === "BROUILLON" || e.statut === "REJETEE") && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(e)}
                              title="Modifier l'écriture"
                              aria-label="Modifier"
                              className="inline-flex items-center justify-center rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40 transition shadow-xs"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                            </button>
                            {e.statut === "BROUILLON" && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await comptabiliteApi.soumettreValidation(e.id);
                                    showResult({
                                      variant: "success",
                                      title: "Écriture soumise",
                                      message: "L'écriture a été soumise au circuit de validation (EF-008).",
                                    });
                                    chargerEcritures();
                                  } catch (err: any) {
                                    showResult({
                                      variant: "error",
                                      title: "Erreur soumission",
                                      message: err.message || "Erreur lors de la transmission.",
                                    });
                                  }
                                }}
                                title="Soumettre au circuit de validation (EF-008)"
                                aria-label="Soumettre"
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 p-1.5 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition shadow-xs"
                              >
                                <PaperAirplaneIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteEcriture(e)}
                              title="Supprimer définitivement l'écriture brouillon"
                              aria-label="Supprimer"
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition shadow-xs"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Saisie d'Écriture */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Nouvelle Saisie d'Écriture Comptable
                </h2>
                <p className="text-xs text-gray-500">
                  Règle EF-011 : L'écriture doit être strictement équilibrée. Règle EF-012 : Au moins 2 lignes.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* En-tête de pièce */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Journal
                </label>
                <select
                  value={journalId}
                  onChange={(e) => setJournalId(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {journaux.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.codeJournal} — {j.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Date d'écriture
                </label>
                <input
                  type="date"
                  value={dateEcriture}
                  onChange={(e) => setDateEcriture(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Réf. Pièce (Facture, Chèque...)
                </label>
                <input
                  type="text"
                  placeholder="Ex: FAC-2026-0042"
                  value={pieceRef}
                  onChange={(e) => setPieceRef(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Période
                </label>
                <select
                  value={periodeId}
                  onChange={(e) => setPeriodeId(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {exercices
                    .find((e) => e.id === exerciceId)
                    ?.periodes?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.libelle} ({p.statut})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Libellé général de l'écriture
              </label>
              <input
                type="text"
                placeholder="Ex: Règlement facture fournisseur matériel informatique"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Tableau des lignes */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Lignes d'Écriture ({lignes.length})
                </span>
                <button
                  type="button"
                  onClick={ajouterLigne}
                  className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Ajouter Ligne
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {lignes.map((ligne, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div className="col-span-4">
                      <select
                        value={ligne.compteId}
                        onChange={(e) => handleCompteChange(idx, e.target.value)}
                        className="w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Sélectionner un compte...</option>
                        {comptes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.numero} — {c.intitule}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Libellé ligne"
                        value={ligne.libelleLigne}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLignes((prev) => {
                            const copy = [...prev];
                            copy[idx].libelleLigne = val;
                            return copy;
                          });
                        }}
                        className="w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Débit"
                        value={ligne.montantDebit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLignes((prev) => {
                            const copy = [...prev];
                            copy[idx].montantDebit = val;
                            if (val > 0) copy[idx].montantCredit = 0;
                            return copy;
                          });
                        }}
                        className="w-full rounded border border-gray-300 p-1.5 text-xs text-right font-mono text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Crédit"
                        value={ligne.montantCredit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLignes((prev) => {
                            const copy = [...prev];
                            copy[idx].montantCredit = val;
                            if (val > 0) copy[idx].montantDebit = 0;
                            return copy;
                          });
                        }}
                        className="w-full rounded border border-gray-300 p-1.5 text-xs text-right font-mono text-purple-600 dark:border-gray-700 dark:bg-gray-800 dark:text-purple-400"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(idx)}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        <TrashIcon className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total et Équilibre */}
            <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-gray-100/70 p-4 dark:border-gray-800 dark:bg-gray-800/60 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs text-gray-500">Contrôle d'Équilibre (EF-011) :</span>
                <div className="mt-1 flex items-center gap-2">
                  {estEquilibree ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Écriture Équilibrée
                    </span>
                  ) : (
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      ⚠ Déséquilibre de {formatCurrency(ecart)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-sm">
                <div>
                  <span className="text-xs text-gray-500">Total Débit : </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(totDebit)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Total Crédit : </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totCredit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting || !estEquilibree}
                onClick={() => handleSubmit(false)}
                className="rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300"
              >
                Sauvegarder Brouillon
              </button>
              <button
                type="button"
                disabled={isSubmitting || !estEquilibree}
                onClick={() => handleSubmit(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Traitement..." : "Sauvegarder & Soumettre"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail Pièce Comptable */}
      {detailEcriture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {detailEcriture.numEcriture || "ÉCRITURE BROUILLON"}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      detailEcriture.statut === "VALIDEE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : detailEcriture.statut === "EN_ATTENTE_VALIDATION"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : detailEcriture.statut === "REJETEE"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {detailEcriture.statut}
                  </span>
                </div>
                <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                  {detailEcriture.libelle}
                </h2>
              </div>
              <button
                onClick={() => setDetailEcriture(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Métadonnées de la pièce */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Date d'opération</span>
                <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                  {new Date(detailEcriture.dateEcriture).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Journal</span>
                <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                  {detailEcriture.journal?.codeJournal || "OD"} — {detailEcriture.journal?.libelle || "Journal"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Pièce Réf.</span>
                <p className="mt-0.5 font-mono font-semibold text-gray-900 dark:text-white">
                  {detailEcriture.pieceRef || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Date Pièce</span>
                <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                  {detailEcriture.datePiece ? new Date(detailEcriture.datePiece).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>
            </div>

            {/* Motif de rejet si existant */}
            {detailEcriture.statut === "REJETEE" && detailEcriture.motifRejet && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                <span className="font-bold">Motif du rejet (EF-029) : </span>
                <span>{detailEcriture.motifRejet}</span>
              </div>
            )}

            {/* Tableau des lignes */}
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                    <th className="py-2.5 px-3">N° Compte</th>
                    <th className="py-2.5 px-3">Intitulé</th>
                    <th className="py-2.5 px-3">Libellé Ligne</th>
                    <th className="py-2.5 px-3 text-right">Débit</th>
                    <th className="py-2.5 px-3 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {detailEcriture.lignes?.map((l, idx) => (
                    <tr key={l.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900 dark:text-white">
                        {l.compte?.numero || (l as any).compteNumero || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300">
                        {l.compte?.intitule || (l as any).compteIntitule || "—"}
                        {l.compteAuxiliaire && (
                          <span className="ml-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                            ({l.compteAuxiliaire.codeAuxiliaire})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">
                        {l.libelleLigne || detailEcriture.libelle}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-900 dark:text-white">
                        {Number(l.montantDebit) > 0 ? formatCurrency(Number(l.montantDebit)) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-900 dark:text-white">
                        {Number(l.montantCredit) > 0 ? formatCurrency(Number(l.montantCredit)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-mono font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <td colSpan={3} className="py-2.5 px-3 text-right">
                      Totaux :
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(
                        detailEcriture.lignes?.reduce((s, l) => s + (Number(l.montantDebit) || 0), 0) || 0,
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-600 dark:text-purple-400">
                      {formatCurrency(
                        detailEcriture.lignes?.reduce((s, l) => s + (Number(l.montantCredit) || 0), 0) || 0,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer modal */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Imprimer la pièce
                </button>
                {(detailEcriture.statut === "BROUILLON" || detailEcriture.statut === "REJETEE") && (
                  <button
                    onClick={() => {
                      const e = detailEcriture;
                      setDetailEcriture(null);
                      openEdit(e);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-400"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                )}
                {detailEcriture.statut === "BROUILLON" && (
                  <button
                    onClick={async () => {
                      await comptabiliteApi.soumettreValidation(detailEcriture.id);
                      setDetailEcriture(null);
                      chargerEcritures();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    Soumettre
                  </button>
                )}
              </div>
              <button
                onClick={() => setDetailEcriture(null)}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Écriture */}
      {editEcriture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Modifier l'Écriture : {editEcriture.pieceRef || editEcriture.numEcriture || "BROUILLON"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Ajustement des imputations comptables et contrôle du principe de la partie double (AUDCIF / EF-011).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEcriture(false);
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Date d'opération
                  </label>
                  <input
                    type="date"
                    required
                    value={editDateEcriture}
                    onChange={(e) => setEditDateEcriture(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Pièce Réf.
                  </label>
                  <input
                    type="text"
                    value={editPieceRef}
                    onChange={(e) => setEditPieceRef(e.target.value)}
                    placeholder="Ex: FA-2026-001"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Libellé général
                  </label>
                  <input
                    type="text"
                    required
                    value={editLibelle}
                    onChange={(e) => setEditLibelle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Lignes d'imputation */}
              <div className="mt-4">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Lignes d'imputation ({editLignes.length})
                  </h3>
                  <button
                    type="button"
                    onClick={ajouterLigneEdit}
                    className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Ajouter Ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {editLignes.map((ligne, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center rounded-lg border border-gray-200 bg-gray-50/50 p-2 dark:border-gray-800 dark:bg-gray-800/40 text-xs"
                    >
                      <div className="col-span-4">
                        <select
                          required
                          value={ligne.compteId}
                          onChange={(e) => handleCompteChangeEdit(index, e.target.value)}
                          className="w-full rounded border border-gray-300 p-1.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Sélectionner un compte...</option>
                          {comptes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.numero} — {c.intitule}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={ligne.libelleLigne}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditLignes((prev) => {
                              const copy = [...prev];
                              copy[index].libelleLigne = val;
                              return copy;
                            });
                          }}
                          placeholder="Libellé de la ligne"
                          className="w-full rounded border border-gray-300 p-1.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ligne.montantDebit || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditLignes((prev) => {
                              const copy = [...prev];
                              copy[index].montantDebit = val;
                              if (val > 0) copy[index].montantCredit = 0;
                              return copy;
                            });
                          }}
                          placeholder="Débit"
                          className="w-full text-right font-mono rounded border border-gray-300 p-1.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={ligne.montantCredit || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditLignes((prev) => {
                              const copy = [...prev];
                              copy[index].montantCredit = val;
                              if (val > 0) copy[index].montantDebit = 0;
                              return copy;
                            });
                          }}
                          placeholder="Crédit"
                          className="w-full text-right font-mono rounded border border-gray-300 p-1.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => supprimerLigneEdit(index)}
                          className="rounded p-1 text-gray-400 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barre de contrôle d'équilibre en édition */}
              {(() => {
                const deb = editLignes.reduce((s, l) => s + (Number(l.montantDebit) || 0), 0);
                const cred = editLignes.reduce((s, l) => s + (Number(l.montantCredit) || 0), 0);
                const diff = Math.abs(deb - cred);
                const ok = diff < 0.01 && deb > 0;
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800 text-xs">
                    <div>
                      {ok ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ✓ Écriture Équilibrée
                        </span>
                      ) : (
                        <span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          ⚠ Déséquilibre de {formatCurrency(diff)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 font-mono">
                      <span>Total Débit : <strong>{formatCurrency(deb)}</strong></span>
                      <span>Total Crédit : <strong>{formatCurrency(cred)}</strong></span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditEcriture(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateEcriture(false)}
                  className="rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300"
                >
                  {isUpdating ? "Enregistrement..." : "Sauvegarder les modifications"}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateEcriture(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                >
                  {isUpdating ? "Traitement..." : "Sauvegarder & Soumettre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
