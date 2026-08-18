"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateurIndemniteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [anciennete, setAnciennete] = useState<number>(3);
  const [salaireMoyen, setSalaireMoyen] = useState<number>(350000);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await rhApi.simulateSeverance(anciennete, salaireMoyen);
      setSimulation(res);
    } catch (err) {
      console.error("Erreur simulation indemnité:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Simulateur d'Indemnités de Licenciement (CCGT Bénin)
          </h2>
          <p className="text-xs text-gray-500">
            Calcul légal par tranches d'ancienneté (30 % pour 1-5 ans, 35 % pour 6-10 ans, 40 % au-delà)
          </p>
        </div>

        <form onSubmit={handleSimulate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ancienneté (Années)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              required
              value={anciennete}
              onChange={(e) => setAnciennete(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salaire Mensuel Moyen des 12 Derniers Mois (FCFA)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              required
              value={salaireMoyen}
              onChange={(e) => setSalaireMoyen(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Calcul..." : "Calculer l'indemnité"}
            </button>
          </div>
        </form>

        {simulation && (
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-5 dark:border-brand-900/50 dark:bg-brand-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-200/50 pb-3 dark:border-brand-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Indemnité de Licenciement Totale Estimée :
              </span>
              <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(simulation.indemniteLicenciementEstimee)}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ventilation par tranche (Convention Collective) :
              </h4>
              {simulation.tranches?.map((t: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs py-1 text-gray-600 dark:text-gray-300">
                  <span>Tranche {t.tranche} ({t.annees} an(s) à {t.taux}) :</span>
                  <span className="font-semibold">{formatCurrency(t.montant)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
