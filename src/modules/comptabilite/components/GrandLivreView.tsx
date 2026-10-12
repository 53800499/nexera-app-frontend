"use client";

import React, { useEffect, useState } from "react";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaExercice,
  GrandLivreCompte,
} from "../types/comptabilite.types";

export const GrandLivreView: React.FC = () => {
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<string>("");
  const [compteNumero, setCompteNumero] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [grandLivre, setGrandLivre] = useState<GrandLivreCompte[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    comptabiliteApi.getExercices().then((exs) => {
      setExercices(exs);
      const courant = exs.find((e) => e.statut === "OUVERT") || exs[0];
      if (courant) {
        setSelectedExercice(courant.id);
        chargerGrandLivre(courant.id);
      }
    });
  }, []);

  const chargerGrandLivre = async (exId?: string) => {
    const id = exId || selectedExercice;
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await comptabiliteApi.getGrandLivre({
        exerciceId: id,
        compteNumero: compteNumero || undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      });
      setGrandLivre(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Grand Livre Général
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Détail chronologique des mouvements validés par compte, avec solde progressif (EF-034, EF-035).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Imprimer / Exporter
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-4">
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Exercice
          </label>
          <select
            value={selectedExercice}
            onChange={(e) => {
              setSelectedExercice(e.target.value);
              chargerGrandLivre(e.target.value);
            }}
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
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Filtre Compte (N° ou Racine)
          </label>
          <input
            type="text"
            placeholder="Ex: 521, 411, 701..."
            value={compteNumero}
            onChange={(e) => setCompteNumero(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Date Début
          </label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => chargerGrandLivre()}
            className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Grand Livre per Account */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : grandLivre.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          Aucun compte mouvementé avec écriture validée pour cette sélection.
        </div>
      ) : (
        <div className="space-y-6">
          {grandLivre.map((c) => (
            <div
              key={c.compteId}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Account Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/60">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                    {c.numeroCompte}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {c.intituleCompte}
                  </span>
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Classe {c.classe}
                  </span>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-gray-400">Total Débit : </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(c.totalDebit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Crédit : </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(c.totalCredit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Solde : </span>
                    <span
                      className={`font-bold ${
                        c.soldeFinal >= 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {c.soldeFinal >= 0 ? "D: " : "C: "}
                      {formatCurrency(Math.abs(c.soldeFinal))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">N° Écriture</th>
                    <th className="py-2.5 px-4">Journal</th>
                    <th className="py-2.5 px-4">Pièce</th>
                    <th className="py-2.5 px-4">Libellé</th>
                    <th className="py-2.5 px-4 text-right">Débit</th>
                    <th className="py-2.5 px-4 text-right">Crédit</th>
                    <th className="py-2.5 px-4 text-right">Solde Progressif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {c.lignes.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 px-4 text-gray-800 dark:text-gray-200">
                        {new Date(l.dateEcriture).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-600 dark:text-gray-300">
                        {l.numEcriture}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {l.journalCode}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-gray-500">
                        {l.pieceRef || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">
                        {l.libelle}
                        {l.compteAuxiliaire && (
                          <span className="ml-2 text-[10px] text-indigo-500 font-mono">
                            [{l.compteAuxiliaire.code}]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-900 dark:text-white">
                        {l.debit > 0 ? formatCurrency(l.debit) : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-900 dark:text-white">
                        {l.credit > 0 ? formatCurrency(l.credit) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold ${
                          l.soldeProgressif >= 0
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {formatCurrency(l.soldeProgressif)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
