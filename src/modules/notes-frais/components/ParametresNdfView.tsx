"use client";

import React, { useState } from "react";
import { useNdfReferentiel } from "../hooks/useNotesFrais";
import { ndfApi } from "../services/ndfApi.service";
import type { NdfCategorieDepense } from "../types/notesFrais.types";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  IconBolt,
  IconCheckCircle,
  IconClose,
  IconCar,
  IconBike,
  IconPin,
} from "./NdfIcons";

export const ParametresNdfView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const {
    categories,
    baremesKm,
    baremesPerDiem,
    parametresPays,
    politiques,
    refetchCategories,
    refetchPolitiques,
    isLoading,
  } = useNdfReferentiel("BJ");

  const [activeTab, setActiveTab] = useState<
    "CATEGORIES" | "BAREMES_KM" | "PER_DIEM" | "POLITIQUES" | "PAYS"
  >("CATEGORIES");

  // Modals
  const [isModalCategorieOpen, setIsModalCategorieOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<NdfCategorieDepense | null>(null);
  const [isModalPolitiqueOpen, setIsModalPolitiqueOpen] = useState(false);

  // Form Catégorie
  const [catCode, setCatCode] = useState("");
  const [catLibelle, setCatLibelle] = useState("");
  const [catCompte, setCatCompte] = useState("6251");
  const [catTvaRecup, setCatTvaRecup] = useState(true);
  const [catTauxTva, setCatTauxTva] = useState(18);
  const [catJustifOblig, setCatJustifOblig] = useState(true);

  // Form Politique
  const [polCatId, setPolCatId] = useState("");
  const [polNiveau, setPolNiveau] = useState("TOUS");
  const [polPlafond, setPolPlafond] = useState<number>(50000);
  const [polDateDebut, setPolDateDebut] = useState("2026-01-01");

  const openCreateCategorie = () => {
    setEditingCategorie(null);
    setCatCode("");
    setCatLibelle("");
    setCatCompte("6251");
    setCatTvaRecup(true);
    setCatTauxTva(18);
    setCatJustifOblig(true);
    setIsModalCategorieOpen(true);
  };

  const openEditCategorie = (cat: NdfCategorieDepense) => {
    setEditingCategorie(cat);
    setCatCode(cat.code);
    setCatLibelle(cat.libelle);
    setCatCompte(cat.compteSyscohadaDefaut || "6251");
    setCatTvaRecup(cat.tvaRecuperableParDefaut ?? true);
    setCatTauxTva(cat.tauxTvaParDefaut ?? 18);
    setCatJustifOblig(cat.justificatifObligatoire ?? true);
    setIsModalCategorieOpen(true);
  };

  const handleSaveCategorie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catCode || !catLibelle) return;

    void runAction({
      loadingMessage: editingCategorie
        ? "Mise à jour de la catégorie..."
        : "Création de la catégorie de dépense...",
      success: {
        title: editingCategorie ? "Catégorie mise à jour" : "Catégorie créée",
        message: `${catLibelle} (${catCode})`,
      },
      error: {
        title: "Erreur d'enregistrement",
        message: "Impossible d'enregistrer cette catégorie de dépense.",
      },
      action: async () => {
        if (editingCategorie) {
          await ndfApi.updateCategorie(editingCategorie.id, {
            libelle: catLibelle,
            compteSyscohadaDefaut: catCompte,
            tvaRecuperableParDefaut: catTvaRecup,
            tauxTvaParDefaut: Number(catTauxTva),
            justificatifObligatoire: catJustifOblig,
          });
        } else {
          await ndfApi.createCategorie({
            code: catCode.trim().toUpperCase(),
            libelle: catLibelle.trim(),
            compteSyscohadaDefaut: catCompte.trim(),
            tvaRecuperableParDefaut: catTvaRecup,
            tauxTvaParDefaut: Number(catTauxTva),
            justificatifObligatoire: catJustifOblig,
          });
        }
        await refetchCategories();
        setIsModalCategorieOpen(false);
      },
    });
  };

  const handleDeleteCategorie = (id: string, libelle: string) => {
    void runAction({
      confirm: {
        title: "Désactiver cette catégorie de dépense ?",
        message: `La catégorie « ${libelle} » ne sera plus proposée lors de la saisie de nouvelles dépenses.`,
        confirmLabel: "Désactiver",
        variant: "danger",
      },
      loadingMessage: "Désactivation en cours...",
      success: {
        title: "Catégorie désactivée",
        message: libelle,
      },
      error: {
        title: "Action impossible",
        message: "La catégorie n'a pas pu être désactivée.",
      },
      action: async () => {
        await ndfApi.deleteCategorie(id);
        await refetchCategories();
      },
    });
  };

  const handleSeedDefaultCategories = () => {
    void runAction({
      confirm: {
        title: "Initialiser les catégories standard ?",
        message:
          "Les catégories officielles (Hôtel, Repas, Carburant, Péage, Fournitures, Transport...) seront chargées avec leurs comptes SYSCOHADA et règles fiscales.",
        confirmLabel: "Initialiser",
        variant: "default",
      },
      loadingMessage: "Chargement du référentiel standard...",
      success: {
        title: "Catégories initialisées",
        message: "Le catalogue de frais standard est prêt à l'emploi.",
      },
      error: {
        title: "Échec de l'initialisation",
        message: "Impossible d'initialiser les catégories standard.",
      },
      action: async () => {
        await ndfApi.seedCategories();
        await refetchCategories();
      },
    });
  };

  const handleCreatePolitique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!polCatId) return;

    void runAction({
      loadingMessage: "Enregistrement du plafond...",
      success: {
        title: "Plafond de dépense enregistré",
        message: `Plafond de ${formatCurrency(polPlafond)} appliqué pour le niveau sélectionné.`,
      },
      error: {
        title: "Erreur de configuration",
        message: "Impossible d'enregistrer cette politique de dépense.",
      },
      action: async () => {
        await ndfApi.createPolitique({
          categorieDepenseId: polCatId,
          niveauHierarchique: polNiveau === "TOUS" ? undefined : polNiveau,
          plafondMontant: Number(polPlafond),
          plafondDevise: "XOF",
          dateDebutValidite: polDateDebut,
        });
        await refetchPolitiques();
        setIsModalPolitiqueOpen(false);
      },
    });
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres & Barèmes Fiscaux (Notes de Frais)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Catégories de frais, barèmes kilométriques officiels, forfaits journaliers et plafonds de dépenses
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("CATEGORIES")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "CATEGORIES"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Catégories de Dépenses ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("BAREMES_KM")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "BAREMES_KM"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Barèmes Kilométriques ({baremesKm.length})
        </button>
        <button
          onClick={() => setActiveTab("PER_DIEM")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "PER_DIEM"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Barèmes Per Diem ({baremesPerDiem.length})
        </button>
        <button
          onClick={() => setActiveTab("POLITIQUES")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "POLITIQUES"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Plafonds & Politiques ({politiques.length})
        </button>
        <button
          onClick={() => setActiveTab("PAYS")}
          className={`pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "PAYS"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Règles Fiscales & Délais
        </button>
      </div>

      {/* 1. CATÉGORIES DE DÉPENSES */}
      {activeTab === "CATEGORIES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Définition des types de dépenses admissibles, taux de TVA par défaut, compte comptable et déductibilité fiscale.
            </p>
            <div className="flex items-center gap-2">
              {categories.length === 0 && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleSeedDefaultCategories}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300"
                >
                  <IconBolt className="size-3.5" />
                  <span>Initialiser Catégories Standard</span>
                </button>
              )}
              <button
                type="button"
                onClick={openCreateCategorie}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
              >
                <span>+ Nouvelle Catégorie</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="p-3 font-semibold">Catégorie</th>
                  <th className="p-3 font-semibold">Code</th>
                  <th className="p-3 font-semibold">Compte SYSCOHADA</th>
                  <th className="p-3 font-semibold text-center">Taux TVA Défaut</th>
                  <th className="p-3 font-semibold text-center">TVA Récupérable / Déductibilité</th>
                  <th className="p-3 font-semibold text-center">Justificatif</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Aucune catégorie de dépense enregistrée. Cliquez sur <strong>« + Nouvelle Catégorie »</strong> ou <strong>« Initialiser Catégories Standard »</strong>.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">
                        {cat.libelle}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs font-bold rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {cat.code}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {cat.compteSyscohadaDefaut || "6251"}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-200">
                        {cat.tauxTvaParDefaut ?? 18} %
                      </td>
                      <td className="p-3 text-center">
                        {cat.tvaRecuperableParDefaut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <IconCheckCircle className="size-3 text-emerald-600 dark:text-emerald-400" />
                            Déductible / Récupérable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <IconClose className="size-3 text-gray-500" />
                            Non déductible
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs">
                        {cat.justificatifObligatoire ? (
                          <span className="font-medium text-amber-700 dark:text-amber-400">Requis dès 1 FCFA</span>
                        ) : (
                          <span className="text-gray-400">Optionnel</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCategorie(cat)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategorie(cat.id, cat.libelle)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. BARÈMES KILOMÉTRIQUES */}
      {activeTab === "BAREMES_KM" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Barème Fiscal Kilométrique Officiel — République du Bénin (2026)
            </h3>
            <p className="text-xs text-gray-500">
              Applicable aux véhicules personnels utilisés à titre professionnel
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="p-3 font-semibold">Type de Véhicule</th>
                <th className="p-3 font-semibold">Puissance Fiscale</th>
                <th className="p-3 font-semibold text-right">Indemnité / Km</th>
                <th className="p-3 font-semibold">Date d'effet</th>
                <th className="p-3 font-semibold">Texte Légal de Référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {baremesKm.map((b) => (
                <tr key={b.id}>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {b.typeVehicule === "VOITURE" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <IconCar className="size-3.5 text-gray-600 dark:text-gray-300" />
                        Voiture Particulière
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <IconBike className="size-3.5 text-gray-600 dark:text-gray-300" />
                        Moto / 2 Roues
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {b.puissanceFiscaleMax
                      ? `${b.puissanceFiscaleMin} à ${b.puissanceFiscaleMax} CV`
                      : `> ${b.puissanceFiscaleMin} CV`}
                  </td>
                  <td className="p-3 text-right font-bold text-brand-600 dark:text-brand-400">
                    {b.tauxParKm} {b.deviseCode} / km
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(b.dateDebutValidite).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3 text-xs text-gray-600 dark:text-gray-400">
                    {b.texteReference || "CGI Bénin 2026"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. BARÈMES PER DIEM */}
      {activeTab === "PER_DIEM" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Indemnités Journalières de Mission (Per Diem)
            </h3>
            <p className="text-xs text-gray-500">
              Forfaits journaliers couvrant hébergement et/ou restauration selon la zone
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="p-3 font-semibold">Zone Géographique</th>
                <th className="p-3 font-semibold text-right">Montant Journalier</th>
                <th className="p-3 font-semibold text-center">Hébergement</th>
                <th className="p-3 font-semibold text-center">Restauration</th>
                <th className="p-3 font-semibold">Date d'effet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {baremesPerDiem.map((b) => (
                <tr key={b.id}>
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">
                    <span className="inline-flex items-center gap-1.5">
                      <IconPin className="size-3.5 text-brand-600 dark:text-brand-400" />
                      {b.zoneGeographique}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(b.montantJour)} / jour
                  </td>
                  <td className="p-3 text-center">
                    {b.couvreHebergement ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400">
                        <IconCheckCircle className="size-3" />
                        Inclus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <IconClose className="size-3" />
                        Non
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {b.couvreRestauration ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400">
                        <IconCheckCircle className="size-3" />
                        Inclus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <IconClose className="size-3" />
                        Non
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(b.dateDebutValidite).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. POLITIQUES & PLAFONDS */}
      {activeTab === "POLITIQUES" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (categories.length > 0 && !polCatId) setPolCatId(categories[0].id);
                setIsModalPolitiqueOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600"
            >
              <span>+ Définir un Plafond de Dépense</span>
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="p-3 font-semibold">Catégorie</th>
                  <th className="p-3 font-semibold">Niveau Éligible</th>
                  <th className="p-3 font-semibold text-right">Plafond Autorisé</th>
                  <th className="p-3 font-semibold">Date d'effet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {politiques.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400">
                      Aucun plafond spécifique configuré. Cliquez sur "+ Définir un Plafond" pour en ajouter.
                    </td>
                  </tr>
                ) : (
                  politiques.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">
                        {p.categorieDepense?.libelle}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {p.niveauHierarchique || "Tous les collaborateurs"}
                      </td>
                      <td className="p-3 text-right font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(p.plafondMontant || 0)}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(p.dateDebutValidite).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. RÈGLES FISCALES & DÉLAIS */}
      {activeTab === "PAYS" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {parametresPays.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  {p.codeParametre}
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Bénin 2026
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">{p.libelle}</h4>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {p.valeur} {p.unite || ""}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Texte de référence : <strong>{p.texteReference || "CGI 2026"}</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRÉER / MODIFIER CATÉGORIE */}
      {isModalCategorieOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingCategorie ? "Modifier la Catégorie de Frais" : "Nouvelle Catégorie de Dépense"}
            </h3>
            <form onSubmit={handleSaveCategorie} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Code Unique * (ex: HOTEL, REPAS)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingCategorie)}
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    placeholder="HOTEL"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-mono uppercase text-gray-900 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Compte SYSCOHADA * (ex: 6251)
                  </label>
                  <input
                    type="text"
                    required
                    value={catCompte}
                    onChange={(e) => setCatCompte(e.target.value)}
                    placeholder="6251"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-mono text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Libellé du type de frais *
                </label>
                <input
                  type="text"
                  required
                  value={catLibelle}
                  onChange={(e) => setCatLibelle(e.target.value)}
                  placeholder="Hôtel & Hébergement"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Taux TVA par défaut (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    step={0.1}
                    value={catTauxTva}
                    onChange={(e) => setCatTauxTva(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex flex-col justify-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catTvaRecup}
                      onChange={(e) => setCatTvaRecup(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      TVA Récupérable & Déductible
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catJustifOblig}
                    onChange={(e) => setCatJustifOblig(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    Justificatif / Reçu fiscal obligatoire
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setIsModalCategorieOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 disabled:opacity-50"
                >
                  {isBusy ? "Enregistrement..." : editingCategorie ? "Mettre à jour" : "Créer la catégorie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉER POLITIQUE */}
      {isModalPolitiqueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Définir un Plafond de Dépense
            </h3>
            <form onSubmit={handleCreatePolitique} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Catégorie de Dépense *
                </label>
                <select
                  required
                  value={polCatId}
                  onChange={(e) => setPolCatId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez une catégorie...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.libelle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Niveau Hiérarchique Cible
                </label>
                <select
                  value={polNiveau}
                  onChange={(e) => setPolNiveau(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="TOUS">Tous les collaborateurs</option>
                  <option value="EMPLOYE">Employé / Agent de maîtrise</option>
                  <option value="CADRE">Cadre / Responsable</option>
                  <option value="DIRECTION">Direction Générale / Exécutif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Plafond Maximal Autorisé (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  value={polPlafond}
                  onChange={(e) => setPolPlafond(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date de début d'application *
                </label>
                <input
                  type="date"
                  required
                  value={polDateDebut}
                  onChange={(e) => setPolDateDebut(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalPolitiqueOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 disabled:opacity-50"
                >
                  Enregistrer le plafond
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
