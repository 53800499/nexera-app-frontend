"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type { ComptaExercice, ComptaPeriode } from "../types/comptabilite.types";
import {
  LockClosedIcon,
  PlusIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArchiveBoxIcon,
  PowerIcon,
} from "./ComptaIcons";

const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function formatDateSecurisee(dateVal: any, fallback = "—"): string {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("fr-FR");
}

function formatPeriodeDates(p: ComptaPeriode): string {
  if (p.dateDebut && p.dateFin) {
    const dDebut = new Date(p.dateDebut);
    const dFin = new Date(p.dateFin);
    if (!isNaN(dDebut.getTime()) && !isNaN(dFin.getTime())) {
      return `Du ${dDebut.toLocaleDateString("fr-FR")} au ${dFin.toLocaleDateString("fr-FR")}`;
    }
  }

  if (p.anneeMois) {
    const [yStr, mStr] = p.anneeMois.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    if (!isNaN(y) && !isNaN(m)) {
      const dDebut = new Date(y, m - 1, 1);
      const dFin = new Date(y, m, 0);
      return `Du ${dDebut.toLocaleDateString("fr-FR")} au ${dFin.toLocaleDateString("fr-FR")}`;
    }
  }

  return "Période d'activité";
}

function getPeriodeLibelle(p: ComptaPeriode): string {
  if (p.libelle && !p.libelle.startsWith("Période ")) {
    return p.libelle;
  }
  if (p.anneeMois) {
    const [yStr, mStr] = p.anneeMois.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    if (!isNaN(m) && m >= 1 && m <= 12) {
      return `${MOIS_NOMS[m - 1]} ${y}`;
    }
  }
  return p.libelle || "Période";
}

function getPeriodeNumero(p: ComptaPeriode): number {
  if (p.numeroPeriode) return p.numeroPeriode;
  if (p.anneeMois) {
    const [, mStr] = p.anneeMois.split("-");
    const m = parseInt(mStr, 10);
    if (!isNaN(m)) return m;
  }
  return 1;
}

export const ExercicesClotureView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<ComptaExercice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal Nouvel Exercice
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnee, setNewAnnee] = useState(new Date().getFullYear());
  const [newDateDebut, setNewDateDebut] = useState(`${new Date().getFullYear()}-01-01`);
  const [newDateFin, setNewDateFin] = useState(`${new Date().getFullYear()}-12-31`);
  const [isCreating, setIsCreating] = useState(false);

  // Modal Détail Exercice
  const [detailExercice, setDetailExercice] = useState<ComptaExercice | null>(null);

  // Modal Réouverture
  const [showReouvrirModal, setShowReouvrirModal] = useState(false);
  const [periodeToReopen, setPeriodeToReopen] = useState<ComptaPeriode | null>(null);
  const [motifReouverture, setMotifReouverture] = useState("");

  useEffect(() => {
    chargerExercices();
  }, []);

  const chargerExercices = async () => {
    try {
      const data = await comptabiliteApi.getExercices();
      setExercices(data);
      const courant = data.find((e) => e.statut === "OUVERT") || data[0];
      setSelectedExercice(courant || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExercice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await comptabiliteApi.createExercice({
        annee: Number(newAnnee),
        dateDebut: newDateDebut,
        dateFin: newDateFin,
      });
      setShowCreateModal(false);
      showResult({
        variant: "success",
        title: "Exercice créé",
        message: `L'exercice comptable ${newAnnee} a été créé avec ses 12 périodes mensuelles.`,
      });
      await chargerExercices();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur création exercice",
        message: err.message || "Erreur lors de la création de l'exercice.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloturerPeriode = async (p: ComptaPeriode) => {
    const confirmed = await confirm({
      title: "Clôturer la période",
      message: `Confirmez-vous la clôture de la période ${p.libelle} ? Cette action verrouillera toute nouvelle saisie d'écriture sur ce mois (EF-010).`,
      confirmLabel: "Clôturer la période",
      cancelLabel: "Annuler",
      variant: "warning",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await comptabiliteApi.cloturerPeriode(p.id);
      showResult({
        variant: "success",
        title: "Période clôturée",
        message: `La période ${p.libelle} a été clôturée avec succès.`,
      });
      await chargerExercices();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur clôture période",
        message: err.message || "Erreur lors de la clôture de la période.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloturerExercice = async () => {
    if (!selectedExercice) return;
    const confirmed = await confirm({
      title: "Clôture définitive de l'exercice",
      message: `Êtes-vous sûr de vouloir clôturer définitivement l'exercice ${selectedExercice.annee} ? Cette action générera les écritures de détermination du résultat (131/139) et les à-nouveaux (journal AN avec libellé REPORT) (EF-051).`,
      confirmLabel: "Clôturer définitivement",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await comptabiliteApi.cloturerExercice(selectedExercice.id);
      showResult({
        variant: "success",
        title: "Exercice clôturé",
        message: `L'exercice ${selectedExercice.annee} a été clôturé avec succès. Les écritures de bilan d'ouverture sont prêtes.`,
      });
      await chargerExercices();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur clôture exercice",
        message: err.message || "Erreur lors de la clôture de l'exercice.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmerReouverture = async () => {
    if (!selectedExercice || !periodeToReopen || !motifReouverture.trim()) {
      showResult({
        variant: "error",
        title: "Motif obligatoire (EF-052)",
        message: "Le motif de réouverture est obligatoire pour la traçabilité d'audit.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await comptabiliteApi.rouvrirExercice(
        selectedExercice.id,
        periodeToReopen.id,
        motifReouverture.trim(),
      );
      setShowReouvrirModal(false);
      setMotifReouverture("");
      setPeriodeToReopen(null);
      showResult({
        variant: "success",
        title: "Période rouverte",
        message: "Période rouverte pour régularisation avec succès.",
      });
      await chargerExercices();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur réouverture",
        message: err.message || "Erreur lors de la réouverture.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiverExercice = async () => {
    if (!selectedExercice) return;
    const confirmed = await confirm({
      title: "Archivage & Scellement FEC (EF-055)",
      message: `ATTENTION ACTION IRRÉVERSIBLE : L'archivage de l'exercice ${selectedExercice.annee} scellera définitivement le FEC avec empreinte SHA-256 et interdira toute modification future. Continuer ?`,
      confirmLabel: "Archiver et sceller définitivement",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await comptabiliteApi.archiverExercice(selectedExercice.id);
      showResult({
        variant: "success",
        title: "Exercice archivé",
        message: `L'exercice ${selectedExercice.annee} a été archivé et scellé avec succès.`,
      });
      await chargerExercices();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur archivage",
        message: err.message || "Erreur lors de l'archivage de l'exercice.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Clôtures Périodiques & Exercices
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion du cycle de vie comptable : clôture mensuelle (EF-010), clôture annuelle, à-nouveaux et archivage irréversible (EF-055).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setNewAnnee(new Date().getFullYear());
              setNewDateDebut(`${new Date().getFullYear()}-01-01`);
              setNewDateFin(`${new Date().getFullYear()}-12-31`);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvel Exercice
          </button>
          {selectedExercice?.statut === "OUVERT" && (
            <button
              onClick={handleCloturerExercice}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
            >
              <LockClosedIcon className="w-4 h-4" />
              Clôturer l'Exercice {selectedExercice.annee}
            </button>
          )}
          {selectedExercice?.statut === "CLOTURE" && (
            <button
              onClick={handleArchiverExercice}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-rose-500 disabled:opacity-50"
            >
              <LockClosedIcon className="w-4 h-4" />
              Archiver Définitivement (Scellement)
            </button>
          )}
        </div>
      </div>

      {/* Table Synthétique des Exercices */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-gray-50/75 p-3.5 font-bold text-xs uppercase tracking-wider text-gray-700 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
          Liste des Exercices Comptables
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
              <th className="py-2.5 px-4">Année Fiscale</th>
              <th className="py-2.5 px-4">Période d'activité</th>
              <th className="py-2.5 px-4 text-center">Périodes Mensuelles</th>
              <th className="py-2.5 px-4 text-center">Statut</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {exercices.map((ex) => {
              const isSelected = selectedExercice?.id === ex.id;
              const periodesCloturees = ex.periodes?.filter((p) => p.statut === "CLOTUREE").length || 0;
              const totalPeriodes = ex.periodes?.length || 12;

              return (
                <tr
                  key={ex.id}
                  className={`transition ${
                    isSelected
                      ? "bg-blue-50/50 dark:bg-blue-950/20"
                      : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-sm text-gray-900 dark:text-white">
                    {ex.annee}
                    {isSelected && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        Sélectionné
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    Du {formatDateSecurisee(ex.dateDebut)} au {formatDateSecurisee(ex.dateFin)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {periodesCloturees} / {totalPeriodes} clôturées
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        ex.statut === "OUVERT"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : ex.statut === "CLOTURE"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {ex.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailExercice(ex)}
                        title="Consulter les détails de l'exercice"
                        aria-label="Détail"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => setSelectedExercice(ex)}
                          title="Sélectionner pour afficher les périodes"
                          aria-label="Sélectionner"
                          className="inline-flex items-center justify-center rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40 transition shadow-xs"
                        >
                          <CursorArrowRaysIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {ex.statut === "OUVERT" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExercice(ex);
                            handleCloturerExercice();
                          }}
                          title="Clôturer l'exercice comptable (EF-048)"
                          aria-label="Clôturer"
                          className="inline-flex items-center justify-center rounded-lg border border-indigo-200 p-1.5 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition shadow-xs"
                        >
                          <LockClosedIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {ex.statut === "CLOTURE" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExercice(ex);
                            handleArchiverExercice();
                          }}
                          title="Archiver l'exercice clôturé"
                          aria-label="Archiver"
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition shadow-xs"
                        >
                          <ArchiveBoxIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Periods 12-month Grid */}
      {selectedExercice && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
              Périodes Mensuelles de l'Exercice {selectedExercice.annee} (EF-048 Clôture séquentielle)
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {selectedExercice.periodes?.map((p) => {
                const estCloturee = p.statut === "CLOTUREE";
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 transition ${
                      estCloturee
                        ? "border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/40"
                        : "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        P{String(getPeriodeNumero(p)).padStart(2, "0")} — {getPeriodeLibelle(p)}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          estCloturee
                            ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {p.statut}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-gray-500">
                      {formatPeriodeDates(p)}
                    </p>

                    <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {!estCloturee ? (
                        <button
                          type="button"
                          onClick={() => handleCloturerPeriode(p)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 shadow-xs"
                        >
                          <LockClosedIcon className="w-3.5 h-3.5" />
                          Clôturer Mois
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPeriodeToReopen(p);
                            setShowReouvrirModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 shadow-xs"
                        >
                          <PowerIcon className="w-3.5 h-3.5" />
                          Rouvrir (EF-052)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Réouverture Ponctuelle */}
      {showReouvrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Réouverture de Période pour Régularisation (UC-13)
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Règle EF-052 : La réouverture ponctuelle exige un motif obligatoire et trace chaque écriture post-clôture.
            </p>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Motif réglementaire de la réouverture
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Écriture d'inventaire omise, ajustement amortissement suite à contrôle..."
                value={motifReouverture}
                onChange={(e) => setMotifReouverture(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReouvrirModal(false);
                  setPeriodeToReopen(null);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!motifReouverture.trim() || isProcessing}
                onClick={handleConfirmerReouverture}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-500 disabled:opacity-50"
              >
                Confirmer la Réouverture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Créer Nouvel Exercice */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Ouvrir un Nouvel Exercice Comptable
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Conformément à l'AUDCIF, l'exercice couvre 12 mois civils consécutifs avec génération automatique des 12 périodes mensuelles P01 à P12.
            </p>

            <form onSubmit={handleCreateExercice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Année Fiscale (ex: 2026)
                </label>
                <input
                  type="number"
                  required
                  min={2000}
                  max={2100}
                  value={newAnnee}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    setNewAnnee(y);
                    if (!isNaN(y)) {
                      setNewDateDebut(`${y}-01-01`);
                      setNewDateFin(`${y}-12-31`);
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Date de Début
                </label>
                <input
                  type="date"
                  required
                  value={newDateDebut}
                  onChange={(e) => setNewDateDebut(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Date de Fin
                </label>
                <input
                  type="date"
                  required
                  value={newDateFin}
                  onChange={(e) => setNewDateFin(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                >
                  {isCreating ? "Création en cours..." : "Créer l'Exercice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détail Exercice */}
      {detailExercice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  EXERCICE FISCAL
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exercice {detailExercice.annee}
                </h2>
              </div>
              <button
                onClick={() => setDetailExercice(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Statut Comptable</span>
                <p className="mt-1 font-semibold">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] ${
                      detailExercice.statut === "OUVERT"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : detailExercice.statut === "CLOTURE"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {detailExercice.statut}
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Périodes Clôturées</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {detailExercice.periodes?.filter((p) => p.statut === "CLOTUREE").length || 0} /{" "}
                  {detailExercice.periodes?.length || 12}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Période d'activité légale</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  Du {formatDateSecurisee(detailExercice.dateDebut)} au {formatDateSecurisee(detailExercice.dateFin)}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Règles SYSCOHADA</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300 text-[11px]">
                  {detailExercice.statut === "OUVERT"
                    ? "Saisies et validations actives. Clôtures mensuelles séquentielles (EF-048)."
                    : detailExercice.statut === "CLOTURE"
                    ? "Exercice clôturé. Écritures de résultat et à-nouveaux (AN) générées."
                    : "Exercice définitivement scellé et archivé. Fichier FEC certifié (EF-055)."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="flex gap-2">
                {detailExercice.statut === "OUVERT" && (
                  <button
                    onClick={() => {
                      setSelectedExercice(detailExercice);
                      setDetailExercice(null);
                      handleCloturerExercice();
                    }}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Clôturer Exercice
                  </button>
                )}
                {detailExercice.statut === "CLOTURE" && (
                  <button
                    onClick={() => {
                      setSelectedExercice(detailExercice);
                      setDetailExercice(null);
                      handleArchiverExercice();
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                  >
                    Archiver Définitivement
                  </button>
                )}
              </div>
              <button
                onClick={() => setDetailExercice(null)}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
