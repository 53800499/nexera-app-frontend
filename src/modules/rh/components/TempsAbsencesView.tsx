"use client";

import React, { useEffect, useState, useMemo } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhAbsence, RhEmploye, RhReleveTemps, RhSoldeConge } from "../types/rh.types";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { TimeIcon, CalenderIcon, PieChartIcon, PlusIcon, CheckCircleIcon, CloseIcon, PencilIcon } from "@/icons";
import { AjusterSoldeCongeModal } from "./AjusterSoldeCongeModal";
import { formatTimeRecordStatus, getAbsenceStatusBadge } from "../utils/rhFormatters";

export const TempsAbsencesView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"releves" | "absences" | "soldes">("releves");
  const [employes, setEmployes] = useState<RhEmploye[]>([]);
  const [releves, setReleves] = useState<RhReleveTemps[]>([]);
  const [absences, setAbsences] = useState<RhAbsence[]>([]);
  const [soldes, setSoldes] = useState<RhSoldeConge[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Soldes de congés state
  const [selectedAnnee, setSelectedAnnee] = useState<number>(2026);
  const [searchSoldes, setSearchSoldes] = useState("");
  const [isAjusterModalOpen, setIsAjusterModalOpen] = useState(false);
  const [soldeToAdjust, setSoldeToAdjust] = useState<RhSoldeConge | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Modals
  const [isReleveModalOpen, setIsReleveModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);

  // Form relevé
  const [releveForm, setReleveForm] = useState({
    employeId: "",
    dateJour: new Date().toISOString().split("T")[0],
    heuresNormales: 8,
    heuresSup15: 0,
    heuresSup50: 0,
    heuresSupNuit: 0,
    heuresSupDimancheFerie: 0,
  });

  // Form absence
  const [absenceForm, setAbsenceForm] = useState({
    employeId: "",
    typeAbsenceId: "",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
    nombreJoursOuvrables: 1,
    motif: "",
  });

  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empResSettled, absTypesSettled] = await Promise.allSettled([
        rhApi.listEmployes(),
        rhApi.listTypesAbsence().catch(() => rhApi.listAbsenceTypes("BJ")),
      ]);
      const empRes = empResSettled.status === "fulfilled" ? empResSettled.value : [];
      const absTypes = absTypesSettled.status === "fulfilled" ? absTypesSettled.value : [];

      if (empResSettled.status === "rejected") {
        const msg = empResSettled.reason?.message || "Serveur ou réseau indisponible";
        console.warn("Avertissement salariés temps/absences:", msg);
        setError(
          msg.includes("indisponible") || msg.includes("fetch")
            ? "Serveur ou réseau indisponible. Impossible de récupérer les données complètes."
            : msg,
        );
      }

      const safeEmps = Array.isArray(empRes) ? empRes : ((empRes as any)?.data || []);
      const safeAbsTypes = Array.isArray(absTypes) ? absTypes : ((absTypes as any)?.data || []);
      setEmployes(safeEmps);
      setAbsenceTypes(safeAbsTypes);

      if (safeEmps.length > 0) {
        setReleveForm((prev) => ({ ...prev, employeId: prev.employeId || safeEmps[0].id }));
        setAbsenceForm((prev) => ({ ...prev, employeId: prev.employeId || safeEmps[0].id }));
      }
      if (safeAbsTypes.length > 0) {
        setAbsenceForm((prev) => ({ ...prev, typeAbsenceId: prev.typeAbsenceId || safeAbsTypes[0].id }));
      }

      if (activeTab === "releves") {
        const relRes = await rhApi.listRelevesTemps().catch(() => []);
        setReleves(Array.isArray(relRes) ? relRes : ((relRes as any)?.data || []));
      } else if (activeTab === "absences") {
        const absRes = await rhApi.listAbsences().catch(() => []);
        setAbsences(Array.isArray(absRes) ? absRes : ((absRes as any)?.data || []));
      } else if (activeTab === "soldes") {
        const sldRes = await rhApi.listSoldesConges(selectedAnnee).catch(() => []);
        setSoldes(Array.isArray(sldRes) ? sldRes : ((sldRes as any)?.data || []));
      }
    } catch (err: any) {
      console.warn("Erreur chargement données temps/absences:", err?.message || err);
      setError(err?.message || "Serveur ou réseau indisponible.");
      setEmployes([]);
      setAbsenceTypes([]);
      setReleves([]);
      setAbsences([]);
      setSoldes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, isReleveModalOpen, isAbsenceModalOpen, selectedAnnee]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveReleve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releveForm.employeId) {
      toast.warning("Sélection requise", "Veuillez choisir un salarié.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: "Enregistrement du relevé d'heures...",
        success: {
          title: "Relevé enregistré",
          message: "Les heures normales et supplémentaires ont été comptabilisées.",
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer le relevé d'heures.",
        },
        action: async () => {
          await rhApi.saveReleveTemps(releveForm);
          setIsReleveModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceForm.employeId) {
      toast.warning("Sélection requise", "Veuillez choisir un salarié.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: "Enregistrement de la demande d'absence...",
        success: {
          title: "Demande enregistrée",
          message: "La demande d'absence ou congé a été soumise au workflow de validation RH.",
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible de créer la demande d'absence.",
        },
        action: async () => {
          await rhApi.createAbsence(absenceForm);
          setIsAbsenceModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateAbsence = async (id: string, statut: "VALIDE_RH" | "REJETE") => {
    await runAction({
      confirm: {
        title: statut === "VALIDE_RH" ? "Valider cette demande d'absence ?" : "Rejeter cette demande d'absence ?",
        message: statut === "VALIDE_RH"
          ? "Cette action approuve définitivement le congé et déduit automatiquement les jours ouvrables du solde du collaborateur."
          : "Cette action rejette la demande d'absence déposée par le collaborateur.",
        confirmLabel: statut === "VALIDE_RH" ? "Approuver le congé" : "Rejeter la demande",
        variant: statut === "VALIDE_RH" ? "default" : "danger",
      },
      loadingMessage: statut === "VALIDE_RH" ? "Validation de la demande..." : "Rejet de la demande...",
      success: {
        title: statut === "VALIDE_RH" ? "Absence approuvée" : "Absence rejetée",
        message: `La demande a été ${statut === "VALIDE_RH" ? "validée" : "rejetée"} avec succès.`,
      },
      error: {
        title: "Erreur de traitement",
        message: "Impossible de modifier le statut de l'absence.",
      },
      action: async () => {
        await rhApi.validateAbsence(id, { statut });
        await loadData();
      },
    });
  };

  const safeEmployes = Array.isArray(employes) ? employes : [];
  const safeReleves = Array.isArray(releves) ? releves : [];
  const safeAbsences = Array.isArray(absences) ? absences : [];
  const safeSoldes = Array.isArray(soldes) ? soldes : [];

  const handleRecalculerSoldes = async () => {
    try {
      setIsRecalculating(true);
      const res = await rhApi.recalculerSoldesConges(selectedAnnee);
      const safeList = Array.isArray(res) ? res : ((res as any)?.data || []);
      setSoldes(safeList);
      toast.success(
        "Compteurs actualisés",
        `Les droits et soldes de congés pour l'année ${selectedAnnee} ont été recalculés selon les règles légales (Art. 68 CCGT).`
      );
    } catch (err: any) {
      console.warn("Erreur recalcul soldes conges:", err);
      toast.error("Erreur", err.message || "Échec du recalcul des compteurs de congés.");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleOpenAjuster = (solde: RhSoldeConge) => {
    setSoldeToAdjust(solde);
    setIsAjusterModalOpen(true);
  };

  const filteredSoldes = useMemo(() => {
    const list = Array.isArray(soldes) ? soldes : [];
    if (!searchSoldes.trim()) return list;
    const q = searchSoldes.toLowerCase();
    return list.filter((s) => {
      const nom = (s.employe?.nom || "").toLowerCase();
      const prenoms = (s.employe?.prenoms || "").toLowerCase();
      const mat = (s.employe?.matricule || "").toLowerCase();
      return nom.includes(q) || prenoms.includes(q) || mat.includes(q);
    });
  }, [soldes, searchSoldes]);

  const soldesKpis = useMemo(() => {
    const list = Array.isArray(soldes) ? soldes : [];
    const totalSalaries = list.length;
    const totalAcquis = list.reduce((acc, s) => acc + (s.droitsAcquis ?? s.droitsAcquisJours ?? 0), 0);
    const totalConsommes = list.reduce((acc, s) => acc + (s.joursConsommes ?? s.joursPris ?? 0), 0);
    const totalRestants = list.reduce((acc, s) => acc + (s.joursRestants ?? 0), 0);
    return { totalSalaries, totalAcquis, totalConsommes, totalRestants };
  }, [soldes]);
  const safeAbsenceTypes = Array.isArray(absenceTypes) ? absenceTypes : [];

  const formatNumber = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Temps de Travail, Heures Sup & Congés
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pointages quotidiens, majorations d'heures sup (15%, 50%, Nuit, Férié) et compteurs de congés
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsReleveModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-colors"
          >
            <TimeIcon className="h-5 w-5 shrink-0" />
            <span>Saisir Relevé d'Heures</span>
          </button>
          <button
            onClick={() => setIsAbsenceModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors"
          >
            <CalenderIcon className="h-5 w-5 shrink-0" />
            <span>Poser un Congé</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "releves", label: "Relevés d'Heures & Heures Sup" },
          { id: "absences", label: "Demandes de Congés & Absences" },
          { id: "soldes", label: `Compteurs Soldes de Congés (${selectedAnnee})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === "releves" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Salarié</th>
                  <th className="px-6 py-4">Heures Normales</th>
                  <th className="px-6 py-4">HS 15 %</th>
                  <th className="px-6 py-4">HS 50 %</th>
                  <th className="px-6 py-4">HS Nuit / Férié</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-gray-400">Chargement des relevés d'heures...</p>
                    </td>
                  </tr>
                ) : safeReleves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <TimeIcon className="h-6 w-6 shrink-0 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun relevé d'heures enregistré</p>
                      <p className="mt-1 text-xs text-gray-400">Saisissez les pointages et heures supplémentaires des collaborateurs.</p>
                      <button
                        onClick={() => setIsReleveModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                      >
                        <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>Saisir un Relevé</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  safeReleves.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">
                        {r.dateJour ? new Date(r.dateJour).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {r.employe?.nom} {r.employe?.prenoms}
                      </td>
                      <td className="px-6 py-4 font-mono">{formatNumber(r.heuresNormales)} h</td>
                      <td className="px-6 py-4 font-mono text-amber-600 font-bold">{formatNumber(r.heuresSup15)} h</td>
                      <td className="px-6 py-4 font-mono text-orange-600 font-bold">{formatNumber(r.heuresSup50)} h</td>
                      <td className="px-6 py-4 font-mono text-purple-600 font-bold">
                        {formatNumber((r.heuresSupNuit || 0) + (r.heuresSupDimancheFerie || 0))} h
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const st = formatTimeRecordStatus(r.statutValidation);
                          return (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "absences" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Salarié</th>
                  <th className="px-6 py-4">Type de Congé</th>
                  <th className="px-6 py-4">Période</th>
                  <th className="px-6 py-4">Jours Ouvrables</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-gray-400">Chargement des demandes...</p>
                    </td>
                  </tr>
                ) : safeAbsences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <CalenderIcon className="h-6 w-6 shrink-0 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Aucune demande de congé enregistrée</p>
                      <p className="mt-1 text-xs text-gray-400">Posez une demande pour validation hiérarchique et RH.</p>
                      <button
                        onClick={() => setIsAbsenceModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                      >
                        <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>Poser un Congé</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  safeAbsences.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {a.employe?.nom} {a.employe?.prenoms}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{a.employe?.matricule}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {a.typeAbsence?.libelle || "Congé"}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        Du {a.dateDebut ? new Date(a.dateDebut).toLocaleDateString("fr-FR") : "-"} au {a.dateFin ? new Date(a.dateFin).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white font-mono">
                        {a.nombreJoursOuvrables} j
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const absSt = getAbsenceStatusBadge(a.statut);
                          return (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${absSt.badgeClass}`}>
                              {absSt.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.statut === "SOUMIS" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleValidateAbsence(a.id, "VALIDE_RH")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>Approuver</span>
                            </button>
                            <button
                              onClick={() => handleValidateAbsence(a.id, "REJETE")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                            >
                              <CloseIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>Rejeter</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Traité</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "soldes" && (
        <div className="space-y-4">
          {/* Barre d'outils et sélecteur d'année */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Exercice / Année
                </span>
                <select
                  value={selectedAnnee}
                  onChange={(e) => setSelectedAnnee(Number(e.target.value))}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026 (En cours)</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <div className="flex-1 sm:w-64">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Rechercher un salarié
                </span>
                <input
                  type="text"
                  placeholder="Nom, prénom, matricule..."
                  value={searchSoldes}
                  onChange={(e) => setSearchSoldes(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRecalculerSoldes}
                disabled={isRecalculating || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/80 transition-colors disabled:opacity-50"
              >
                {isRecalculating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>Recalculer les droits légaux</span>
              </button>
            </div>
          </div>

          {/* Cartes KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Salariés Suivis</span>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{soldesKpis.totalSalaries}</p>
              <span className="text-[11px] text-gray-400">Collaborateurs actifs</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Droits Acquis Cumulés</span>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatNumber(soldesKpis.totalAcquis)} j
              </p>
              <span className="text-[11px] text-gray-400">Base 2j / mois + majorations</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jours Consommés</span>
              <p className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {formatNumber(soldesKpis.totalConsommes)} j
              </p>
              <span className="text-[11px] text-gray-400">Absences validées en {selectedAnnee}</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Solde Restant Disponible</span>
              <p className="mt-1 text-2xl font-bold font-mono text-brand-600 dark:text-brand-400">
                {formatNumber(soldesKpis.totalRestants)} jours
              </p>
              <span className="text-[11px] text-gray-400">Prêts à être posés</span>
            </div>
          </div>

          {/* Tableau des compteurs */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Salarié</th>
                    <th className="px-6 py-4 text-center">Année</th>
                    <th className="px-6 py-4 text-center">Droits Acquis (2j/mois)</th>
                    <th className="px-6 py-4 text-center">Droits Suppl.</th>
                    <th className="px-6 py-4 text-center">Report N-1</th>
                    <th className="px-6 py-4 text-center">Consommés</th>
                    <th className="px-6 py-4 text-center">Solde Restant Net</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="mt-2 text-xs text-gray-400">Chargement et synchronisation des compteurs...</p>
                      </td>
                    </tr>
                  ) : filteredSoldes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <PieChartIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          Aucun compteur trouvé pour l'exercice {selectedAnnee}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Cliquez sur "Recalculer les droits légaux" pour générer les compteurs des salariés actifs.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSoldes.map((s) => {
                      const acquis = s.droitsAcquis ?? s.droitsAcquisJours ?? 0;
                      const sup = (s.droitsSupplementairesAnciennete || 0) + (s.droitsSupplementairesEnfants || 0);
                      const report = s.soldeReporte ?? 0;
                      const consommes = s.joursConsommes ?? s.joursPris ?? 0;
                      const restants = s.joursRestants ?? Math.max(0, acquis + sup + report - consommes);

                      return (
                        <tr key={s.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {s.employe?.nom} {s.employe?.prenoms}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {s.employe?.matricule}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-medium">{s.anneeReference}</td>
                          <td className="px-6 py-4 text-center font-medium text-emerald-600 font-mono">
                            {formatNumber(acquis)} j
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            {sup > 0 ? (
                              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                +{formatNumber(sup)} j
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            {report > 0 ? (
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                +{formatNumber(report)} j
                              </span>
                            ) : (
                              <span className="text-gray-400">0 j</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-amber-600 font-mono">
                            {formatNumber(consommes)} j
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block rounded-lg px-3 py-1 text-sm font-bold font-mono ${
                              restants > 0
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {formatNumber(restants)} jours
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenAjuster(s)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                              title="Ajuster ou régulariser ce solde"
                            >
                              <PencilIcon className="h-3.5 w-3.5 text-gray-500" />
                              <span>Ajuster</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Relevé d'Heures */}
      <Modal isOpen={isReleveModalOpen} onClose={() => setIsReleveModalOpen(false)} className="max-w-lg p-6">
        <form onSubmit={handleSaveReleve} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Saisie du Relevé d'Heures
            </h2>
            <p className="text-xs text-gray-500">
              Pointages et heures supplémentaires avec majorations légales Bénin
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Salarié *</label>
            <select
              required
              value={releveForm.employeId}
              onChange={(e) => setReleveForm({ ...releveForm, employeId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="">-- Sélectionner un salarié --</option>
              {safeEmployes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.matricule} - {e.nom} {e.prenoms}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <input
              type="date"
              required
              value={releveForm.dateJour}
              onChange={(e) => setReleveForm({ ...releveForm, dateJour: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Heures Normales</label>
              <input
                type="number"
                min={0}
                max={24}
                value={releveForm.heuresNormales}
                onChange={(e) => setReleveForm({ ...releveForm, heuresNormales: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">HS 15 % (Jour)</label>
              <input
                type="number"
                min={0}
                value={releveForm.heuresSup15}
                onChange={(e) => setReleveForm({ ...releveForm, heuresSup15: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">HS 50 %</label>
              <input
                type="number"
                min={0}
                value={releveForm.heuresSup50}
                onChange={(e) => setReleveForm({ ...releveForm, heuresSup50: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">HS Nuit (50 %)</label>
              <input
                type="number"
                min={0}
                value={releveForm.heuresSupNuit}
                onChange={(e) => setReleveForm({ ...releveForm, heuresSupNuit: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsReleveModalOpen(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 shadow-xs disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{isSubmitting ? "Enregistrement..." : "Enregistrer Relevé"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Poser Congé */}
      <Modal isOpen={isAbsenceModalOpen} onClose={() => setIsAbsenceModalOpen(false)} className="max-w-lg p-6">
        <form onSubmit={handleSaveAbsence} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Demande de Congé / Déclaration d'Absence
            </h2>
            <p className="text-xs text-gray-500">
              Soumission d'une absence pour calcul des indemnités et décompte de congés
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Salarié *</label>
            <select
              required
              value={absenceForm.employeId}
              onChange={(e) => setAbsenceForm({ ...absenceForm, employeId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="">-- Sélectionner un salarié --</option>
              {safeEmployes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.matricule} - {e.nom} {e.prenoms}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type d'Absence *</label>
            <select
              required
              value={absenceForm.typeAbsenceId}
              onChange={(e) => setAbsenceForm({ ...absenceForm, typeAbsenceId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="">-- Choisir le type --</option>
              {safeAbsenceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.libelle} {t.estPaye ? "(Rémunéré)" : "(Non rémunéré)"}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Date de début *</label>
              <input
                type="date"
                required
                value={absenceForm.dateDebut}
                onChange={(e) => setAbsenceForm({ ...absenceForm, dateDebut: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Date de fin *</label>
              <input
                type="date"
                required
                value={absenceForm.dateFin}
                onChange={(e) => setAbsenceForm({ ...absenceForm, dateFin: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre de jours ouvrables *</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              required
              value={absenceForm.nombreJoursOuvrables}
              onChange={(e) => setAbsenceForm({ ...absenceForm, nombreJoursOuvrables: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Motif / Commentaire</label>
            <textarea
              value={absenceForm.motif}
              onChange={(e) => setAbsenceForm({ ...absenceForm, motif: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAbsenceModalOpen(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 shadow-xs disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{isSubmitting ? "Soumission..." : "Soumettre la Demande"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modale d'ajustement du solde de congés */}
      <AjusterSoldeCongeModal
        isOpen={isAjusterModalOpen}
        onClose={() => {
          setIsAjusterModalOpen(false);
          setSoldeToAdjust(null);
        }}
        solde={soldeToAdjust}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};

