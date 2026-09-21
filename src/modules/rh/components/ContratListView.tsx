"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat } from "../types/rh.types";
import { ContratFormModal } from "./ContratFormModal";
import { ContratDetailModal } from "./ContratDetailModal";
import { ContratAvenantModal } from "./ContratAvenantModal";
import { ContratPeriodeEssaiModal } from "./ContratPeriodeEssaiModal";
import { ContratRuptureModal } from "./ContratRuptureModal";
import { SimulateurIndemniteModal } from "./SimulateurIndemniteModal";
import { EyeIcon, PencilIcon, FileIcon, TimeIcon, CalenderIcon, UserIcon, CheckCircleIcon, PlusIcon, AlertIcon } from "@/icons";
import { formatContractStatus, formatProbationStatus, formatContractType } from "../utils/rhFormatters";
import { ErrorState } from "@/shared/components/feedback";

export const ContratListView: React.FC = () => {
  const [contrats, setContrats] = useState<RhContrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSimulateurOpen, setIsSimulateurOpen] = useState(false);
  const [selectedContratId, setSelectedContratId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contratToEdit, setContratToEdit] = useState<RhContrat | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [contratForAvenant, setContratForAvenant] = useState<RhContrat | null>(null);
  const [isAvenantOpen, setIsAvenantOpen] = useState(false);
  const [contratForEssai, setContratForEssai] = useState<RhContrat | null>(null);
  const [isEssaiOpen, setIsEssaiOpen] = useState(false);
  const [contratForRupture, setContratForRupture] = useState<RhContrat | null>(null);
  const [isRuptureOpen, setIsRuptureOpen] = useState(false);

  // Active Dropdown state for rows
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContrats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await rhApi.listContrats({
        statut: statusFilter !== "ALL" ? statusFilter : undefined,
        typeContrat: typeFilter !== "ALL" ? typeFilter : undefined,
      });
      const items = Array.isArray(res) ? res : ((res as any)?.data || []);
      setContrats(items);
    } catch (err: any) {
      console.warn("Erreur chargement contrats:", err?.message || err);
      setError(
        err?.message ||
          "Serveur ou réseau indisponible. Vérifiez la connexion au serveur API et réessayez.",
      );
      setContrats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContrats();
  }, [statusFilter, typeFilter]);

  // Filtrage local par recherche textuelle
  const filteredContrats = useMemo(() => {
    if (!search.trim()) return contrats;
    const q = search.toLowerCase();
    return contrats.filter((c) => {
      const num = (c.numeroContrat || "").toLowerCase();
      const nom = (c.employe?.nom || "").toLowerCase();
      const prenom = (c.employe?.prenoms || "").toLowerCase();
      const mat = (c.employe?.matricule || "").toLowerCase();
      const pst = (c.poste?.intitule || "").toLowerCase();
      const etab = (c.etablissement?.nom || "").toLowerCase();
      return (
        num.includes(q) ||
        nom.includes(q) ||
        prenom.includes(q) ||
        mat.includes(q) ||
        pst.includes(q) ||
        etab.includes(q)
      );
    });
  }, [contrats, search]);

  // Métriques KPI
  const kpis = useMemo(() => {
    const total = contrats.length;
    const actifs = contrats.filter((c) => c.statut === "ACTIF").length;
    const enEssai = contrats.filter((c) => {
      const ess = c.periodeEssai || (c.periodesEssai && c.periodesEssai[0]);
      return ess && ess.statutIssue === "EN_COURS";
    }).length;

    const now = new Date().getTime();
    const sixtyDaysLater = now + 60 * 24 * 60 * 60 * 1000;
    const cddEndingSoon = contrats.filter((c) => {
      if (c.typeContrat !== "CDD" || !c.dateFinPrevue || c.statut !== "ACTIF") return false;
      const end = new Date(c.dateFinPrevue).getTime();
      return end >= now && end <= sixtyDaysLater;
    }).length;

    const masseSalariale = contrats
      .filter((c) => c.statut === "ACTIF")
      .reduce((sum, c) => sum + (c.salaireBaseMensuel || 0), 0);

    return { total, actifs, enEssai, cddEndingSoon, masseSalariale };
  }, [contrats]);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  const formatNumber = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const getStatusBadge = (statut?: string) => {
    switch (statut) {
      case "ACTIF":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      case "BROUILLON":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      case "SUSPENDU":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "ROMPU":
      case "RESILIE":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
      case "TERMINE":
      case "CLOTURE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleOpenDetail = (contratId: string) => {
    setSelectedContratId(contratId);
    setIsDetailOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenEdit = (contrat: RhContrat) => {
    setContratToEdit(contrat);
    setIsEditOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenAvenant = (contrat: RhContrat) => {
    setContratForAvenant(contrat);
    setIsAvenantOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenEssai = (contrat: RhContrat) => {
    setContratForEssai(contrat);
    setIsEssaiOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenRupture = (contrat: RhContrat) => {
    setContratForRupture(contrat);
    setIsRuptureOpen(true);
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Contrats & Carrières
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cycle contractuel complet : contrats (CDI, CDD, Stage), périodes d'essai, avenants salariaux et ruptures CCGT
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSimulateurOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-colors"
          >
            <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="18" />
              <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth={3} strokeLinecap="round" />
            </svg>
            <span>Simulateur CCGT</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden transition-all active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Nouveau Contrat</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Contrats
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <FileIcon className="h-4 w-4 shrink-0" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-gray-900 dark:text-white">
            {kpis.total}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Dossiers répertoriés</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Contrats Actifs
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircleIcon className="h-4 w-4 shrink-0" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {kpis.actifs}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {kpis.total > 0 ? `${Math.round((kpis.actifs / kpis.total) * 100)}% de l'effectif` : "En cours"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Périodes d'Essai
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TimeIcon className="h-4 w-4 shrink-0" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            {kpis.enEssai}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">En cours d'évaluation</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Échéances CDD &lt; 60j
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <CalenderIcon className="h-4 w-4 shrink-0" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {kpis.cddEndingSoon}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Renouvellement ou terme</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Masse Salariale Base
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <UserIcon className="h-4 w-4 shrink-0" />
            </span>
          </div>
          <p className="mt-2 text-lg font-black font-mono text-gray-900 dark:text-white truncate">
            {formatCurrency(kpis.masseSalariale)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Base brute mensuelle</p>
        </div>
      </div>

      {/* Barre de Filtres & Recherche */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, matricule, N° contrat, poste..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtre Type de Contrat */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Type :</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="ALL">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGE">Stage</option>
              <option value="APPRENTISSAGE">Apprentissage</option>
              <option value="INTERIM">Intérim</option>
              <option value="CONSULTANT">Consultant</option>
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="TERMINE">Terminé / Clôturé</option>
              <option value="ROMPU">Rompu / Résilié</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 self-start md:self-auto">
          {filteredContrats.length} contrat(s) affiché(s)
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={fetchContrats}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      {/* Tableau des Contrats avec Colonne ACTIONS */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Contrat</th>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">Type & Poste</th>
                <th className="px-6 py-4">Période & Essai</th>
                <th className="px-6 py-4 text-right">Salaire Brut Base</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des contrats en cours...</p>
                  </td>
                </tr>
              ) : error && filteredContrats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <ErrorState
                      title="Serveur ou réseau indisponible"
                      message={error}
                      onRetry={fetchContrats}
                    />
                  </td>
                </tr>
              ) : filteredContrats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <FileIcon className="h-6 w-6 shrink-0" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Aucun contrat ne correspond à vos critères
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Modifiez vos filtres ou créez un nouveau contrat de travail.
                    </p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                    >
                      + Nouveau Contrat
                    </button>
                  </td>
                </tr>
              ) : (
                filteredContrats.map((c) => {
                  const essai = c.periodeEssai || (c.periodesEssai && c.periodesEssai[0]);
                  const isMenuOpen = openDropdownId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* N° Contrat */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenDetail(c.id)}
                          className="font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                          title="Cliquer pour afficher la fiche détaillée 360°"
                        >
                          {c.numeroContrat}
                        </button>
                        {c._count?.avenants && c._count.avenants > 0 ? (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {c._count.avenants} avenant(s)
                          </span>
                        ) : null}
                      </td>

                      {/* Salarié */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                            {c.employe?.prenoms?.[0] || "E"}
                            {c.employe?.nom?.[0] || ""}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {c.employe ? `${c.employe.nom} ${c.employe.prenoms}` : "Salarié"}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {c.employe?.matricule}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Poste */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-brand-50 border border-brand-200/60 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950/50 dark:border-brand-800 dark:text-brand-300">
                            {c.typeContrat}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {c.poste?.intitule || "Poste non défini"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {c.etablissement?.nom || "Établissement principal"}
                        </div>
                      </td>

                      {/* Période & Essai */}
                      <td className="px-6 py-4 text-xs">
                        <div>Du {formatDate(c.dateDebut)}</div>
                        <div className="text-gray-400">
                          {c.dateFinPrevue
                            ? `Au ${formatDate(c.dateFinPrevue)}`
                            : "Durée indéterminée"}
                        </div>
                        {essai && (
                          <div className="mt-1">
                            {(() => {
                              const prob = formatProbationStatus(essai.statutIssue);
                              return (
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${prob.badgeClass}`}>
                                  {prob.label}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                      </td>

                      {/* Salaire Brut Base & Taux Risque AT */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(c.salaireBaseMensuel)}
                        </div>
                        {c.tauxRisqueAt !== undefined && c.tauxRisqueAt !== null ? (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold mt-0.5">
                            Risque AT : {c.tauxRisqueAt} %
                          </div>
                        ) : c.poste?.tauxRisqueAt ? (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Risque poste : {c.poste.tauxRisqueAt} %
                          </div>
                        ) : null}
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        {(() => {
                          const st = formatContractStatus(c.statut);
                          return (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* COLONNE ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          {/* 1. Consulter Fiche 360° */}
                          <button
                            onClick={() => handleOpenDetail(c.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                            title="Voir le dossier 360° du contrat"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {/* 2. Modifier le contrat */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400 transition-colors"
                            title="Modifier les conditions du contrat"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>

                          {/* 3. Bouton Dropdown Menu Actions Avancées */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdownId(isMenuOpen ? null : c.id)
                              }
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors font-bold text-base ${
                                isMenuOpen
                                  ? "bg-gray-100 dark:bg-gray-800 text-brand-600"
                                  : ""
                              }`}
                              title="Toutes les actions contractuelles"
                            >
                              ⋮
                            </button>

                            {/* Menu contextuel popover */}
                            {isMenuOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-1 z-30 w-56 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-850 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                                  Actions Contractuelles
                                </div>

                                {/* Détail 360 */}
                                <button
                                  onClick={() => handleOpenDetail(c.id)}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 font-medium"
                                >
                                  <EyeIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                  <span>Détail complet 360°</span>
                                </button>

                                {/* Nouvel Avenant */}
                                {c.statut === "ACTIF" && (
                                  <button
                                    onClick={() => handleOpenAvenant(c)}
                                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40 font-medium"
                                  >
                                    <FileIcon className="h-4 w-4 shrink-0 text-brand-500" />
                                    <span>Créer un Avenant (Salaire/Poste)</span>
                                  </button>
                                )}

                                {/* Période d'essai */}
                                {essai && (
                                  <button
                                    onClick={() => handleOpenEssai(c)}
                                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 font-medium"
                                  >
                                    <TimeIcon className="h-4 w-4 shrink-0 text-amber-500" />
                                    <span>Gérer la Période d'Essai</span>
                                  </button>
                                )}

                                {/* Modifier */}
                                <button
                                  onClick={() => handleOpenEdit(c)}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 font-medium"
                                >
                                  <PencilIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                  <span>Modifier le Contrat</span>
                                </button>

                                {/* Simulateur CCGT */}
                                <button
                                  onClick={() => {
                                    setIsSimulateurOpen(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/40 font-medium"
                                >
                                  <svg className="h-4 w-4 shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <rect x="4" y="2" width="16" height="20" rx="2" />
                                    <line x1="8" y1="6" x2="16" y2="6" />
                                    <line x1="16" y1="14" x2="16" y2="18" />
                                    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth={3} strokeLinecap="round" />
                                  </svg>
                                  <span>Simulateur Indemnités CCGT</span>
                                </button>

                                {/* Rupture de Contrat */}
                                {c.statut === "ACTIF" && (
                                  <>
                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                                    <button
                                      onClick={() => handleOpenRupture(c)}
                                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 font-semibold"
                                    >
                                      <AlertIcon className="h-4 w-4 shrink-0 text-rose-500" />
                                      <span>Rupture & Clôture Légale</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
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

      {/* MODALS D'ACTION */}
      {/* 1. Nouveau Contrat (Création) */}
      <ContratFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchContrats}
      />

      {/* 2. Modifier Contrat (Édition) */}
      <ContratFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setContratToEdit(null);
        }}
        onSuccess={fetchContrats}
        initialContrat={contratToEdit}
      />

      {/* 3. Détail 360° du Contrat */}
      <ContratDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedContratId(null);
        }}
        contratId={selectedContratId}
        onEdit={(c) => {
          setIsDetailOpen(false);
          handleOpenEdit(c);
        }}
        onNewAvenant={(c) => {
          setIsDetailOpen(false);
          handleOpenAvenant(c);
        }}
        onManageEssai={(c) => {
          setIsDetailOpen(false);
          handleOpenEssai(c);
        }}
        onRupture={(c) => {
          setIsDetailOpen(false);
          handleOpenRupture(c);
        }}
        onSimulate={() => {
          setIsDetailOpen(false);
          setIsSimulateurOpen(true);
        }}
      />

      {/* 4. Nouvel Avenant */}
      <ContratAvenantModal
        isOpen={isAvenantOpen}
        onClose={() => {
          setIsAvenantOpen(false);
          setContratForAvenant(null);
        }}
        contrat={contratForAvenant}
        onSuccess={fetchContrats}
      />

      {/* 5. Gérer la Période d'Essai */}
      <ContratPeriodeEssaiModal
        isOpen={isEssaiOpen}
        onClose={() => {
          setIsEssaiOpen(false);
          setContratForEssai(null);
        }}
        contrat={contratForEssai}
        onSuccess={fetchContrats}
      />

      {/* 6. Rupture & Clôture Légale */}
      <ContratRuptureModal
        isOpen={isRuptureOpen}
        onClose={() => {
          setIsRuptureOpen(false);
          setContratForRupture(null);
        }}
        contrat={contratForRupture}
        onSuccess={fetchContrats}
      />

      {/* 7. Simulateur CCGT */}
      <SimulateurIndemniteModal
        isOpen={isSimulateurOpen}
        onClose={() => setIsSimulateurOpen(false)}
      />
    </div>
  );
};
