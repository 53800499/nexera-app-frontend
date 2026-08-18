"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhBulletinPaie } from "../types/rh.types";
import { useBulletinPdf } from "../pdf/useBulletinPdf";
import { DownloadIcon, EyeIcon } from "@/icons";

interface Props {
  bulletinId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BulletinPaieDetailModal: React.FC<Props> = ({
  bulletinId,
  isOpen,
  onClose,
}) => {
  const [bulletin, setBulletin] = useState<RhBulletinPaie | null>(null);
  const [loading, setLoading] = useState(false);
  const { isExporting, downloadPdf, openPdf } = useBulletinPdf();

  useEffect(() => {
    if (bulletinId && isOpen) {
      setLoading(true);
      rhApi
        .getBulletinById(bulletinId)
        .then(setBulletin)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [bulletinId, isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const etablissement = bulletin?.cyclePaie?.etablissement;
  const employe = bulletin?.employe;
  const contrat = bulletin?.contrat;

  const handleDownloadPdf = () => {
    if (bulletin) {
      downloadPdf(bulletin);
    }
  };

  const handleOpenPdf = () => {
    if (bulletin) {
      openPdf(bulletin);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-4xl p-6 print:p-0 print:max-w-none"
    >
      {loading || !bulletin ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4 print:text-black">
          {/* Actions barre supérieure (masquée à l'impression) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-800 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Bulletin de Paie • {bulletin.numeroBulletin}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {bulletin.statut}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Période du {new Date(bulletin.dateDebutPeriode).toLocaleDateString("fr-FR")} au{" "}
                {new Date(bulletin.dateFinPeriode).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-all active:scale-[0.98]"
              >
                <EyeIcon className="h-5 w-5 shrink-0" />
                <span>Aperçu PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isExporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <DownloadIcon className="h-6 w-6 shrink-0" />
                )}
                <span>{isExporting ? "Génération..." : "Télécharger PDF"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* ZONE DU BULLETIN OHADA IMPRIMABLE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 print:border-none print:p-0">
            {/* Entête Employeur & Salarié */}
            <div className="grid grid-cols-2 gap-6 border-b border-gray-200 pb-6 dark:border-gray-800 print:border-gray-400">
              {/* Employeur */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 print:text-black">
                <div className="text-base font-bold text-gray-900 dark:text-white print:text-black">
                  {etablissement?.raisonSociale || "ENTREPRISE NEXERA"}
                </div>
                <div>{etablissement?.adresseLigne1 || "Siège Social"}, {etablissement?.ville || "Cotonou"}</div>
                <div>IFU : <strong className="font-mono">{etablissement?.ifu || "0202612345678"}</strong></div>
                <div>N° CNSS Employeur : <strong className="font-mono">{etablissement?.numeroCnss || "CNSS-100234"}</strong></div>
              </div>

              {/* Salarié */}
              <div className="rounded-xl bg-gray-50 p-4 text-xs dark:bg-gray-800/50 print:bg-gray-100 print:text-black">
                <div className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                  {employe?.nom} {employe?.prenoms}
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-gray-500 print:text-gray-700">Matricule :</span>
                  <span className="font-mono font-bold">{employe?.matricule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 print:text-gray-700">Emploi / Poste :</span>
                  <span className="font-medium">{contrat?.poste?.intitule || "Salarié"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 print:text-gray-700">N° CNSS Salarié :</span>
                  <span className="font-mono">{employe?.numeroCnss || "Non affilié"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 print:text-gray-700">N° IFU Salarié :</span>
                  <span className="font-mono">{employe?.numeroIfu || "-"}</span>
                </div>
              </div>
            </div>

            {/* Infos Période & Paiement */}
            <div className="grid grid-cols-3 gap-4 border-b border-gray-200 py-3 text-xs dark:border-gray-800 print:border-gray-400">
              <div>
                <span className="text-gray-500">Période : </span>
                <strong className="text-gray-900 dark:text-white print:text-black">
                  {bulletin.cyclePaie?.mois.toString().padStart(2, "0")}/{bulletin.cyclePaie?.annee}
                </strong>
              </div>
              <div>
                <span className="text-gray-500">Mode de paiement : </span>
                <strong className="text-gray-900 dark:text-white print:text-black">
                  {bulletin.modePaiement}
                </strong>
              </div>
              <div>
                <span className="text-gray-500">Date de paiement : </span>
                <strong className="text-gray-900 dark:text-white print:text-black">
                  {bulletin.datePaiement ? new Date(bulletin.datePaiement).toLocaleDateString("fr-FR") : "-"}
                </strong>
              </div>
            </div>

            {/* Grille des Rubriques */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300 print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Rubrique</th>
                    <th className="py-2.5 px-3 text-right">Base</th>
                    <th className="py-2.5 px-3 text-right">Taux</th>
                    <th className="py-2.5 px-3 text-right">Gains (FCFA)</th>
                    <th className="py-2.5 px-3 text-right">Retenues Salariales</th>
                    <th className="py-2.5 px-3 text-right">Charges Patronales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-300">
                  {bulletin.lignes?.map((ligne) => (
                    <tr key={ligne.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2 px-3 font-mono text-gray-500">{ligne.codeRubrique}</td>
                      <td className="py-2 px-3 font-medium text-gray-900 dark:text-white print:text-black">
                        {ligne.libelleRubrique}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                        {ligne.base ? ligne.base.toLocaleString("fr-FR") : ""}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                        {ligne.taux ? `${ligne.taux} %` : ""}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-gray-900 dark:text-white print:text-black">
                        {ligne.montantGain > 0 ? formatCurrency(ligne.montantGain) : ""}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-red-600 dark:text-red-400 print:text-black">
                        {ligne.montantRetenue > 0 ? formatCurrency(ligne.montantRetenue) : ""}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-purple-600 dark:text-purple-400 print:text-black">
                        {ligne.partPatronaleMontant > 0 ? formatCurrency(ligne.partPatronaleMontant) : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux & Récapitulatif Final */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 print:border-gray-400">
              <div className="rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50 print:bg-gray-100">
                <span className="text-gray-500">Total Salaire Brut</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                  {formatCurrency(bulletin.totalSalaireBrut)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50 print:bg-gray-100">
                <span className="text-gray-500">Total Retenues Salariales</span>
                <div className="text-sm font-bold text-red-600 dark:text-red-400 print:text-black">
                  {formatCurrency(bulletin.totalRetenuesSalariales)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50 print:bg-gray-100">
                <span className="text-gray-500">Charges Patronales (CNSS+VPS)</span>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 print:text-black">
                  {formatCurrency(bulletin.totalChargesPatronales)}
                </div>
              </div>

              <div className="rounded-xl bg-brand-500/10 p-3 text-xs dark:bg-brand-500/20 print:bg-gray-200">
                <span className="text-brand-700 dark:text-brand-300 font-semibold">NET À PAYER</span>
                <div className="text-base font-bold text-brand-600 dark:text-brand-400 print:text-black">
                  {formatCurrency(bulletin.netAPayer)}
                </div>
              </div>
            </div>

            {/* Mentions Légales */}
            <div className="mt-6 text-[10px] text-gray-400 dark:text-gray-500 print:text-gray-600 border-t border-gray-100 pt-3 dark:border-gray-800 text-center">
              Pour faire valoir ce que de droit. Bulletin conforme aux dispositions du Code du Travail et du Code Général des Impôts 2026 de la République du Bénin. Conservez ce bulletin sans limitation de durée.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
