"use client";

import React, { useState } from "react";
import {
  useDepenses,
  useNdfIa,
  useNdfReferentiel,
  useRapportsFrais,
} from "../hooks/useNotesFrais";
import { ndfApi } from "../services/ndfApi.service";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  IconReceipt,
  IconCar,
  IconHotel,
  IconSparkles,
  IconPaperclip,
  IconAlertTriangle,
  IconClose,
} from "./NdfIcons";

export const MesDepensesView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const { depenses, isLoading, createDepense, deleteDepense, isCreating } = useDepenses();
  const { categories, baremesKm, baremesPerDiem } = useNdfReferentiel("BJ");
  const { rapports } = useRapportsFrais();
  const { scannerJustificatif, isScanning } = useNdfIa();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [typeSaisie, setTypeSaisie] = useState<"STANDARD" | "KILOMETRIQUE" | "PER_DIEM">("STANDARD");

  // Form State
  const [rapportId, setRapportId] = useState("");
  const [dateDepense, setDateDepense] = useState(new Date().toISOString().split("T")[0]);
  const [fournisseur, setFournisseur] = useState("");
  const [montantTtc, setMontantTtc] = useState<number>(0);
  const [montantTva, setMontantTva] = useState<number>(0);
  const [tauxTva, setTauxTva] = useState<number>(18);
  const [modePaiement, setModePaiement] = useState<"CARTE_PERSONNELLE" | "ESPECES" | "CARTE_AFFAIRE">("CARTE_PERSONNELLE");
  const [justificatifUrl, setJustificatifUrl] = useState("");

  // Kilometrique State
  const [depart, setDepart] = useState("Cotonou");
  const [arrivee, setArrivee] = useState("Porto-Novo");
  const [distanceKm, setDistanceKm] = useState<number>(35);
  const [puissanceFiscale, setPuissanceFiscale] = useState<number>(6);
  const [typeVehiculeKm, setTypeVehiculeKm] = useState<"VOITURE" | "MOTO">("VOITURE");
  const [calculatedBaremeKmInfo, setCalculatedBaremeKmInfo] = useState<string>("");
  const [appliedBaremeKmId, setAppliedBaremeKmId] = useState<string>("");

  // Per Diem State
  const [nombreJours, setNombreJours] = useState<number>(1);
  const [zoneGeo, setZoneGeo] = useState("Cotonou & Grand Nokoué (Littoral / Atlantique)");
  const [calculatedPerDiemInfo, setCalculatedPerDiemInfo] = useState<string>("");
  const [appliedBaremePerDiemId, setAppliedBaremePerDiemId] = useState<string>("");

  // OCR Simulator
  const handleOcrScan = async (fileUrl: string) => {
    try {
      const res: any = await scannerJustificatif({ fichierUrl: fileUrl, typeFichier: "IMAGE" });
      setMontantTtc(res.montantTtc);
      setMontantTva(res.montantTva);
      setTauxTva(res.tauxTva);
      setFournisseur(res.fournisseur);
      setDateDepense(res.date);
      setJustificatifUrl(fileUrl);
      const cat = categories.find(
        (c) => c.code.toUpperCase() === res.categorieSuggeree.toUpperCase(),
      );
      if (cat) setSelectedCategorie(cat.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculerKm = async () => {
    try {
      const res = await ndfApi.calculerIndemniteKm({
        distanceKm,
        puissanceFiscale,
        typeVehicule: typeVehiculeKm,
        paysCode: "BJ",
      });
      setMontantTtc(res.montantTotal);
      setAppliedBaremeKmId(res.baremeKilometriqueId);
      setCalculatedBaremeKmInfo(
        `${res.tauxParKm} FCFA/km selon barème officiel Bénin 2026 (${res.texteReference || "CGI Bénin 2026"})`,
      );
      setFournisseur(`Trajet ${depart} → ${arrivee} (${distanceKm} km, ${puissanceFiscale} CV)`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculerPerDiem = async () => {
    try {
      const res = await ndfApi.calculerPerDiem({
        nombreJours,
        zoneGeographique: zoneGeo,
        paysCode: "BJ",
      });
      setMontantTtc(res.montantTotal);
      setAppliedBaremePerDiemId(res.baremePerDiemId);
      setCalculatedPerDiemInfo(
        `${formatCurrency(res.montantJour)}/j • Restauration: ${res.couvreRestauration ? "Oui" : "Non"} • Hébergement: ${res.couvreHebergement ? "Oui" : "Non"}`,
      );
      setFournisseur(`Mission ${res.zoneGeographique} (${nombreJours} ${nombreJours > 1 ? "jours" : "jour"})`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rapportId) return;

    const payload: any = {
      ndfRapportFraisId: rapportId,
      categorieDepenseId: selectedCategorie || categories[0]?.id,
      dateDepense,
      fournisseurLibelle: fournisseur,
      montantTtc: Number(montantTtc),
      montantTva: Number(montantTva),
      tauxTvaApplique: Number(tauxTva),
      deviseCode: "XOF",
      modePaiement,
      justificatifUrl: justificatifUrl || undefined,
    };

    if (typeSaisie === "KILOMETRIQUE" && baremesKm.length > 0) {
      const matchedBareme =
        baremesKm.find((b) => b.id === appliedBaremeKmId) ||
        baremesKm.find(
          (b) =>
            b.typeVehicule === typeVehiculeKm &&
            puissanceFiscale >= b.puissanceFiscaleMin &&
            (b.puissanceFiscaleMax == null || puissanceFiscale <= (b.puissanceFiscaleMax ?? Infinity)),
        ) ||
        baremesKm[0];

      payload.depenseKilometrique = {
        trajetDepart: depart,
        trajetArrivee: arrivee,
        distanceKm: Number(distanceKm),
        puissanceFiscaleVehicule: Number(puissanceFiscale),
        baremeKilometriqueId: matchedBareme.id,
      };
    }

    if (typeSaisie === "PER_DIEM" && baremesPerDiem.length > 0) {
      const matchedBareme =
        baremesPerDiem.find((b) => b.id === appliedBaremePerDiemId) ||
        baremesPerDiem.find((b) => b.zoneGeographique === zoneGeo) ||
        baremesPerDiem[0];

      payload.depensePerDiem = {
        nombreJours: Number(nombreJours),
        baremePerDiemId: matchedBareme.id,
      };
    }

    void runAction({
      loadingMessage: "Enregistrement de la dépense...",
      success: {
        title: "Dépense enregistrée",
        message: `${fournisseur || "Frais professionnel"} — ${formatCurrency(montantTtc)}`,
      },
      error: {
        title: "Erreur d'enregistrement",
        message: "Impossible d'enregistrer cette dépense.",
      },
      action: async () => {
        await createDepense(payload);
        setIsModalOpen(false);
      },
    });
  };

  const handleDeleteDepense = (dep: any) => {
    void runAction({
      confirm: {
        title: "Supprimer cette dépense ?",
        message: `La dépense « ${dep.fournisseurLibelle || "Frais"} » d'un montant de ${formatCurrency(dep.montantTtc)} sera définitivement retirée du rapport.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression en cours...",
      success: {
        title: "Dépense supprimée",
        message: dep.fournisseurLibelle || "Ligne supprimée",
      },
      error: {
        title: "Action impossible",
        message: "La dépense n'a pas pu être supprimée.",
      },
      action: () => deleteDepense(dep.id),
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
            Mes Dépenses & Reçus
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saisie individuelle, scan OCR de factures et calculs kilométriques / per diem
          </p>
        </div>
        <button
          onClick={() => {
            if (rapports.length > 0 && !rapportId) {
              setRapportId(rapports[0].id);
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 transition"
        >
          <span>+ Nouvelle Dépense</span>
        </button>
      </div>

      {/* Tableau des dépenses */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Liste de mes dépenses ({depenses.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Catégorie</th>
                <th className="px-4 py-3 font-semibold">Fournisseur / Trajet</th>
                <th className="px-4 py-3 font-semibold text-right">Montant TTC</th>
                <th className="px-4 py-3 font-semibold text-right">TVA Récup.</th>
                <th className="px-4 py-3 font-semibold text-center">Paiement</th>
                <th className="px-4 py-3 font-semibold text-center">Justificatif</th>
                <th className="px-4 py-3 font-semibold text-center">Statut</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Chargement des dépenses...
                  </td>
                </tr>
              ) : depenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Aucune dépense enregistrée. Cliquez sur "+ Nouvelle Dépense" pour commencer.
                  </td>
                </tr>
              ) : (
                depenses.map((dep) => (
                  <tr key={dep.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {new Date(dep.dateDepense).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        {dep.depenseKilometrique ? (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <IconCar className="size-3" />
                            Indemnité Km
                          </span>
                        ) : dep.depensePerDiem ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <IconHotel className="size-3" />
                            Per Diem
                          </span>
                        ) : (
                          <span>{dep.categorieDepense?.libelle || "Frais"}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {dep.fournisseurLibelle || "—"}
                        </span>
                        {dep.depenseKilometrique && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400">
                            <IconCar className="size-3 shrink-0" />
                            {dep.depenseKilometrique.trajetDepart} → {dep.depenseKilometrique.trajetArrivee} ({dep.depenseKilometrique.distanceKm} km • {dep.depenseKilometrique.puissanceFiscaleVehicule} CV)
                          </span>
                        )}
                        {dep.depensePerDiem && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <IconHotel className="size-3 shrink-0" />
                            Mission forfaitaire : {dep.depensePerDiem.nombreJours} {dep.depensePerDiem.nombreJours > 1 ? "jours" : "jour"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(dep.montantTtc)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(dep.montantTva || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          dep.modePaiement === "ESPECES"
                            ? dep.depasseSeuilEspeceLegal
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}
                      >
                        {dep.modePaiement === "ESPECES" ? "Espèces" : "Carte"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dep.justificatifs && dep.justificatifs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <IconPaperclip className="size-3 text-emerald-600 dark:text-emerald-400" />
                          Joint (OCR OK)
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                          Aucun
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          dep.statut === "VALIDEE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : dep.statut === "REJETEE"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {dep.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {dep.statut === "SAISIE" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteDepense(dep)}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Saisie Assistée & OCR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Saisir une dépense professionnelle
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IconClose className="size-5" />
              </button>
            </div>

            {/* Type de Dépense */}
            <div className="mt-4 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setTypeSaisie("STANDARD")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
                  typeSaisie === "STANDARD"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                <IconReceipt className="size-3.5" />
                <span>Facture / Reçu Standard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeSaisie("KILOMETRIQUE");
                  handleCalculerKm();
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
                  typeSaisie === "KILOMETRIQUE"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                <IconCar className="size-3.5" />
                <span>Frais Kilométriques</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeSaisie("PER_DIEM");
                  handleCalculerPerDiem();
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
                  typeSaisie === "PER_DIEM"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                <IconHotel className="size-3.5" />
                <span>Per Diem / Forfait</span>
              </button>
            </div>

            {/* Simulation OCR Assistée */}
            {typeSaisie === "STANDARD" && (
              <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-900 dark:text-brand-300">
                      <IconSparkles className="size-3.5 text-brand-600 dark:text-brand-400" />
                      Scan Intelligent OCR (IA)
                    </span>
                    <p className="text-[11px] text-brand-700 dark:text-brand-400">
                      Glissez ou simulez un reçu pour remplir automatiquement le montant, le commerçant et la TVA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOcrScan("facture_restaurant_cotonou.jpg")}
                      disabled={isScanning}
                      className="rounded bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      {isScanning ? "Analyse..." : "Simuler Restaurant"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOcrScan("facture_hotel_diplomate.pdf")}
                      disabled={isScanning}
                      className="rounded border border-brand-300 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:bg-gray-800 dark:text-brand-300"
                    >
                      Simuler Hôtel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Rapport de Frais Cible (Dossier d'imputation) *
                  </label>
                  <a
                    href="/notes-frais/rapports"
                    className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    + Créer un nouveau rapport
                  </a>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Chaque dépense/reçu individuel est regroupé dans un dossier de note de frais (ex: « Frais du mois » ou « Mission »).
                </p>
                {rapports.length === 0 ? (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                    <IconAlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5 dark:text-amber-400" />
                    <span>
                      Aucun rapport de frais n'a été créé. Veuillez d'abord créer un dossier dans l'onglet{" "}
                      <a href="/notes-frais/rapports" className="font-bold underline">
                        Rapports de Frais
                      </a>{" "}
                      avant de saisir des dépenses individuelles.
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    value={rapportId}
                    onChange={(e) => setRapportId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un rapport de frais...</option>
                    {rapports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.numeroRapport} — {r.objet} ({r.statut})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {typeSaisie === "KILOMETRIQUE" ? (
                <div className="space-y-3 rounded-lg bg-gray-50 p-3.5 dark:bg-gray-800/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Type de Véhicule
                      </label>
                      <select
                        value={typeVehiculeKm}
                        onChange={(e: any) => setTypeVehiculeKm(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="VOITURE">Voiture Particulière</option>
                        <option value="MOTO">Moto / 2 Roues</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Puissance Fiscale (CV)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={puissanceFiscale}
                        onChange={(e) => setPuissanceFiscale(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Ville de Départ
                      </label>
                      <input
                        type="text"
                        value={depart}
                        onChange={(e) => setDepart(e.target.value)}
                        placeholder="Ex: Cotonou"
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Ville d'Arrivée
                      </label>
                      <input
                        type="text"
                        value={arrivee}
                        onChange={(e) => setArrivee(e.target.value)}
                        placeholder="Ex: Porto-Novo"
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Distance Parcourue (km)
                      </label>
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {calculatedBaremeKmInfo && (
                    <div className="rounded border border-brand-200 bg-brand-50/70 p-2 text-[11px] font-medium text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                      ✓ {calculatedBaremeKmInfo}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCalculerKm}
                    className="w-full rounded bg-brand-500 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow transition"
                  >
                    Calculer indemnité kilométrique (Barème Bénin 2026)
                  </button>
                </div>
              ) : typeSaisie === "PER_DIEM" ? (
                <div className="space-y-3 rounded-lg bg-gray-50 p-3.5 dark:bg-gray-800/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Nombre de jours de mission
                      </label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={nombreJours}
                        onChange={(e) => setNombreJours(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Zone Géographique de Mission
                      </label>
                      <select
                        value={zoneGeo}
                        onChange={(e) => {
                          setZoneGeo(e.target.value);
                          const matched = baremesPerDiem.find((b) => b.zoneGeographique === e.target.value);
                          if (matched) {
                            setAppliedBaremePerDiemId(matched.id);
                          }
                        }}
                        className="mt-1 w-full rounded border border-gray-300 p-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        {baremesPerDiem.map((b) => (
                          <option key={b.id} value={b.zoneGeographique}>
                            {b.zoneGeographique} ({formatCurrency(b.montantJour)}/j)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {calculatedPerDiemInfo && (
                    <div className="rounded border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      ✓ {calculatedPerDiemInfo}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCalculerPerDiem}
                    className="w-full rounded bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow transition"
                  >
                    Calculer forfait journalier Per Diem
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Catégorie de Dépense *
                  </label>
                  <select
                    value={selectedCategorie}
                    onChange={(e) => setSelectedCategorie(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.libelle} (Compte {c.compteSyscohadaDefaut || "6251"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Date de la dépense *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateDepense}
                    onChange={(e) => setDateDepense(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Fournisseur / Commerçant
                  </label>
                  <input
                    type="text"
                    value={fournisseur}
                    onChange={(e) => setFournisseur(e.target.value)}
                    placeholder="Ex: Total, Golden Tulip..."
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Mode de Paiement *
                  </label>
                  <select
                    value={modePaiement}
                    onChange={(e: any) => setModePaiement(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="CARTE_PERSONNELLE">Carte Bancaire Personnelle</option>
                    <option value="ESPECES">Espèces (Contrôle seuil 100k CGI Art 21)</option>
                    <option value="CARTE_AFFAIRE">Carte Affaire Entreprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Montant TTC (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={montantTtc}
                    onChange={(e) => setMontantTtc(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Montant TVA Déductible (FCFA)
                  </label>
                  <input
                    type="number"
                    value={montantTva}
                    onChange={(e) => setMontantTva(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Avertissement Seuil Espèces */}
              {modePaiement === "ESPECES" && montantTtc >= 100000 && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  <IconAlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5 dark:text-rose-400" />
                  <span>
                    <strong>Avertissement Fiscal Bénin (CGI 2026 Art. 21) :</strong> Les règlements en espèces &ge; 100 000 FCFA ne sont pas déductibles du bénéfice imposable et feront l'objet d'une anomalie bloquante.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 disabled:opacity-50"
                >
                  {isCreating ? "Enregistrement..." : "Enregistrer la dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
