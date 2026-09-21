"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhBulletinPaie } from "../types/rh.types";
import { BulletinPaieDetailModal } from "../components/BulletinPaieDetailModal";
import { formatCurrencyXOF, formatDateFR, formatPayslipStatus } from "../utils/rhFormatters";
import { useBulletinPdf } from "../pdf/useBulletinPdf";
import { DownloadIcon, EyeIcon, FileIcon } from "@/icons";
import { ErrorState } from "@/shared/components/feedback";

export default function BulletinsListPage() {
  const [bulletins, setBulletins] = useState<RhBulletinPaie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBulletinId, setSelectedBulletinId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [annee, setAnnee] = useState(2026);
  const { downloadPdf, isExporting } = useBulletinPdf();

  const fetchBulletins = () => {
    setLoading(true);
    setError(null);
    rhApi
      .listBulletins({ annee })
      .then((res) => {
        setBulletins(Array.isArray(res) ? res : ((res as any)?.data || []));
      })
      .catch((err) => {
        console.warn("Erreur chargement bulletins:", err?.message || err);
        setError(
          err?.message ||
            "Serveur ou réseau indisponible. Vérifiez la connexion au serveur API et réessayez.",
        );
        setBulletins([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBulletins();
  }, [annee]);

  const safeBulletins = Array.isArray(bulletins) ? bulletins : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bulletins de Paie OHADA
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Consultation, téléchargement et exportation PDF des fiches de paie conformes Bénin CGI 2026
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Année :</span>
          <select
            value={annee}
            onChange={(e) => setAnnee(parseInt(e.target.value, 10))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value={2026}>2026 (CGI 2026)</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Barre de comptage */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Fiches de paie générées
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {safeBulletins.length} bulletin(s)
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={fetchBulletins}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">N° Bulletin</th>
                <th className="px-6 py-4">Période</th>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4 text-right">Salaire Brut</th>
                <th className="px-6 py-4 text-right">Net Imposable</th>
                <th className="px-6 py-4 text-right">Net à Payer</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des bulletins...</p>
                  </td>
                </tr>
              ) : error && safeBulletins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6">
                    <ErrorState
                      title="Serveur ou réseau indisponible"
                      message={error}
                      onRetry={fetchBulletins}
                    />
                  </td>
                </tr>
              ) : safeBulletins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <FileIcon className="h-6 w-6 shrink-0" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun bulletin généré pour {annee}</p>
                    <p className="mt-1 text-xs text-gray-400">Ouvrez un cycle de paie et lancez le calcul automatique.</p>
                  </td>
                </tr>
              ) : (
                safeBulletins.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {b.numeroBulletin}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {formatDateFR(b.dateDebutPeriode)} - {formatDateFR(b.dateFinPeriode)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {b.employe?.nom} {b.employe?.prenoms}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{b.employe?.matricule}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white font-mono">
                      {formatCurrencyXOF(b.totalSalaireBrut)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {formatCurrencyXOF(b.netImposable)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrencyXOF(b.netAPayer)}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const statusBadge = formatPayslipStatus(b.statut);
                        return (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge.badgeClass}`}>
                            {statusBadge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBulletinId(b.id);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-400 transition-colors shadow-2xs"
                        >
                          <EyeIcon className="h-5 w-5 shrink-0" />
                          <span>Détails</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadPdf(b)}
                          disabled={isExporting}
                          title="Télécharger le fichier PDF"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors shadow-2xs"
                        >
                          <DownloadIcon className="h-5 w-5 shrink-0 text-brand-600" />
                          <span>PDF</span>
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

      <BulletinPaieDetailModal
        bulletinId={selectedBulletinId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBulletinId(null);
        }}
      />
    </div>
  );
}
