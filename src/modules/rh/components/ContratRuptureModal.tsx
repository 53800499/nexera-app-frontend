"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat, RhTerminationType } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { formatContractType } from "../utils/rhFormatters";
import { AlertIcon } from "@/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contrat: RhContrat | null;
  onSuccess: () => void;
}

export const ContratRuptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contrat,
  onSuccess,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [typeRupture, setTypeRupture] = useState<RhTerminationType>(
    "RUPTURE_CONVENTIONNELLE"
  );
  const [dateNotification, setDateNotification] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateEffet, setDateEffet] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dureePreavisJours, setDureePreavisJours] = useState(30);
  const [dispensePreavis, setDispensePreavis] = useState(false);

  // Indemnités financières
  const [montantIndemnitePreavis, setMontantIndemnitePreavis] = useState(0);
  const [montantIndemniteLicenciement, setMontantIndemniteLicenciement] = useState(0);
  const [montantIndemniteCongesPayes, setMontantIndemniteCongesPayes] = useState(0);
  const [montantDommagesInterets, setMontantDommagesInterets] = useState(0);
  const [motifDetaille, setMotifDetaille] = useState("");

  const [simulatedSeverance, setSimulatedSeverance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Calcul de l'ancienneté en années
  const getAncienneteYears = () => {
    if (!contrat?.dateDebut || !dateEffet) return 0;
    const start = new Date(contrat.dateDebut).getTime();
    const end = new Date(dateEffet).getTime();
    if (end <= start) return 0;
    const diffYears = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(diffYears * 10) / 10);
  };

  const anciennete = getAncienneteYears();
  const salaireMoyen = contrat?.salaireBaseMensuel || 0;

  // Calcul automatique indicatif de l'indemnité CCGT Bénin
  useEffect(() => {
    if (salaireMoyen > 0 && anciennete > 0) {
      let total = 0;
      if (anciennete <= 5) {
        total = anciennete * (0.3 * salaireMoyen);
      } else if (anciennete <= 10) {
        total = 5 * (0.3 * salaireMoyen) + (anciennete - 5) * (0.35 * salaireMoyen);
      } else {
        total =
          5 * (0.3 * salaireMoyen) +
          5 * (0.35 * salaireMoyen) +
          (anciennete - 10) * (0.4 * salaireMoyen);
      }
      const rounded = Math.round(total);
      setSimulatedSeverance(rounded);

      // Si le type donne droit à indemnité et champ à 0, pré-remplir
      if (
        (typeRupture === "LICENCIEMENT_ECONOMIQUE" ||
          typeRupture === "LICENCIEMENT_MOTIF_PERSONNEL" ||
          typeRupture === "RUPTURE_CONVENTIONNELLE" ||
          typeRupture === "DEPART_RETRAITE") &&
        montantIndemniteLicenciement === 0
      ) {
        setMontantIndemniteLicenciement(rounded);
      }
    } else {
      setSimulatedSeverance(0);
    }
  }, [anciennete, salaireMoyen, typeRupture]);

  if (!contrat) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: contrat.deviseCode || "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val);

  const totalIndemnites =
    Number(montantIndemnitePreavis || 0) +
    Number(montantIndemniteLicenciement || 0) +
    Number(montantIndemniteCongesPayes || 0) +
    Number(montantDommagesInterets || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateNotification || !dateEffet) {
      toast.warning("Champs requis", "Veuillez renseigner les dates de notification et d'effet.");
      return;
    }

    setLoading(true);
    await runAction({
      loadingMessage: "Clôture du contrat et calcul des indemnités...",
      success: {
        title: "Rupture de contrat enregistrée",
        message: `Le contrat ${contrat.numeroContrat} a été clôturé et le statut du salarié est mis à jour (SORTI).`,
      },
      error: { title: "Erreur lors de l'enregistrement de la rupture" },
      action: async () => {
        await rhApi.createRupture(contrat.id, {
          typeRupture,
          dateNotification,
          dateEffet,
          dureePreavisJours: Number(dureePreavisJours),
          dispensePreavis: Boolean(dispensePreavis),
          montantIndemnitePreavis: Number(montantIndemnitePreavis),
          montantIndemniteLicenciement: Number(montantIndemniteLicenciement),
          montantIndemniteCongesPayes: Number(montantIndemniteCongesPayes),
          montantDommagesInterets: Number(montantDommagesInterets),
          motifDetaille: motifDetaille.trim() || undefined,
        });
        onSuccess();
        onClose();
      },
    });
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl bg-white dark:bg-gray-900 rounded-2xl p-6"
    >
      <div className="border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rupture & Clôture Définitive du Contrat</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rappel du salarié et avertissement statut */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Rupture Définitive
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {contrat.employe
                  ? `${contrat.employe.nom} ${contrat.employe.prenoms}`
                  : "Salarié"}
                <span className="ml-2 font-mono text-xs text-gray-500 font-normal">
                  ({contrat.numeroContrat} • {formatContractType(contrat.typeContrat)})
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ancienneté contractuelle estimée : <span className="font-bold text-gray-800 dark:text-gray-200">{anciennete} ans</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Dernier salaire brut :</span>
              <p className="font-mono text-base font-bold text-gray-900 dark:text-white">
                {formatCurrency(salaireMoyen)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1.5">
            <AlertIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Attention : La validation de cette rupture passera le contrat en statut <strong>Rupture de contrat</strong> et l'employé en statut <strong>Sorti d'effectif</strong>.</span>
          </p>
        </div>

        {/* Motif légal de rupture */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Type / Motif Juridique de Rupture *
            </label>
            <select
              value={typeRupture}
              onChange={(e) => setTypeRupture(e.target.value as RhTerminationType)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="RUPTURE_CONVENTIONNELLE">Rupture Conventionnelle Négociée</option>
              <option value="DEMISSION">Démission du Salarié</option>
              <option value="LICENCIEMENT_MOTIF_PERSONNEL">Licenciement pour Motif Personnel</option>
              <option value="LICENCIEMENT_ECONOMIQUE">Licenciement Économique / Restructuration</option>
              <option value="LICENCIEMENT_FAUTE_GRAVE">Licenciement pour Faute Grave</option>
              <option value="LICENCIEMENT_FAUTE_LOURDE">Licenciement pour Faute Lourde</option>
              <option value="FIN_CDD">Fin de Contrat à Durée Déterminée (CDD)</option>
              <option value="DEPART_RETRAITE">Départ à la Retraite</option>
              <option value="MISE_A_RETRAITE">Mise à la Retraite par l'Employeur</option>
              <option value="FORCE_MAJEURE">Cas de Force Majeure</option>
              <option value="DECES">Décès du Salarié</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Date Notification
              </label>
              <input
                type="date"
                value={dateNotification}
                onChange={(e) => setDateNotification(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Date Fin Effet *
              </label>
              <input
                type="date"
                value={dateEffet}
                onChange={(e) => setDateEffet(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Préavis */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-850">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Durée du préavis (jours)
              </label>
              <input
                type="number"
                min={0}
                value={dureePreavisJours}
                onChange={(e) => setDureePreavisJours(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 sm:pt-4">
              <input
                type="checkbox"
                id="dispense"
                checked={dispensePreavis}
                onChange={(e) => setDispensePreavis(e.target.checked)}
                className="h-4 w-4 rounded-md border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="dispense" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                Dispensé de préavis
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Indemnité compensatrice préavis
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={montantIndemnitePreavis}
                onChange={(e) => setMontantIndemnitePreavis(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Indemnités légales & financières CCGT */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/30 p-4 dark:border-brand-900 dark:bg-brand-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider">
              Indemnités Légales & Solde de Tout Compte
            </span>
            {simulatedSeverance !== null && simulatedSeverance > 0 && (
              <button
                type="button"
                onClick={() => setMontantIndemniteLicenciement(simulatedSeverance)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 underline"
              >
                Appliquer calcul légal CCGT : {formatCurrency(simulatedSeverance)}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Indemnité Licenciement CCGT
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={montantIndemniteLicenciement}
                onChange={(e) => setMontantIndemniteLicenciement(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold font-mono text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Congés payés acquis non pris
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={montantIndemniteCongesPayes}
                onChange={(e) => setMontantIndemniteCongesPayes(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Dommages & intérêts / Autres
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={montantDommagesInterets}
                onChange={(e) => setMontantDommagesInterets(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-brand-200/60 dark:border-brand-800/60 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Total estimé des indemnités à verser :
            </span>
            <span className="text-base font-black font-mono text-brand-700 dark:text-brand-300">
              {formatCurrency(totalIndemnites)}
            </span>
          </div>
        </div>

        {/* Motif détaillé */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Motif détaillé / Modalités de la rupture
          </label>
          <textarea
            rows={2}
            value={motifDetaille}
            onChange={(e) => setMotifDetaille(e.target.value)}
            placeholder="Ex : Accord mutuel signé par les deux parties en date du... avec dispense de préavis..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 focus:outline-hidden transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Clôture en cours..." : "Valider la Rupture & Clôturer"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
