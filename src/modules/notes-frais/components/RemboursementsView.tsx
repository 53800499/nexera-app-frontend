"use client";

import React, { useState } from "react";
import { useEmployes } from "@/modules/rh/hooks/useEmployes";
import { useRemboursements } from "../hooks/useNotesFrais";
import { ndfApi } from "../services/ndfApi.service";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { IconCash, IconCreditCard, IconClose } from "./NdfIcons";

export const RemboursementsView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const { remboursements, isLoading, payerRemboursement, basculerSurBulletinPaie, isPaying } =
    useRemboursements();
  const { employes } = useEmployes();

  const [activeTab, setActiveTab] = useState<"REMBOURSEMENTS" | "CARTES">("REMBOURSEMENTS");
  const [selectedRemboursement, setSelectedRemboursement] = useState<any | null>(null);
  const [isModalPayOpen, setIsModalPayOpen] = useState(false);
  const [isModalPaieOpen, setIsModalPaieOpen] = useState(false);

  // Pay Form
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split("T")[0]);
  const [refBancaire, setRefBancaire] = useState("VIR-NDF-" + Date.now().toString().slice(-4));

  // Paie Form
  const [cyclePaie, setCyclePaie] = useState("2026-02");

  // Cartes State
  const [cartes, setCartes] = useState<any[]>([]);
  const [isModalCarteOpen, setIsModalCarteOpen] = useState(false);
  const [carteEmployeId, setCarteEmployeId] = useState("");
  const [carteNumero, setCarteNumero] = useState("4589");
  const [carteEmetteur, setCarteEmetteur] = useState("Ecobank Bénin");
  const [cartePlafond, setCartePlafond] = useState<number>(1000000);

  const fetchCartes = async () => {
    try {
      const res = await ndfApi.listCartesAffaires();
      setCartes(res);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (activeTab === "CARTES") {
      fetchCartes();
    }
  }, [activeTab]);

  const handlePayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemboursement) return;

    const rembId = selectedRemboursement.id;
    const montant = formatCurrency(selectedRemboursement.montantNetRembourse);

    void runAction({
      loadingMessage: "Exécution du virement de remboursement...",
      success: {
        title: "Remboursement exécuté",
        message: `Virement de ${montant} enregistré sous la référence ${refBancaire}.`,
      },
      error: {
        title: "Échec du règlement",
        message: "Impossible d'enregistrer le remboursement.",
      },
      action: async () => {
        await payerRemboursement({
          id: rembId,
          dateRemboursement: datePaiement,
          referenceBancaire: refBancaire,
        });
        setIsModalPayOpen(false);
        setSelectedRemboursement(null);
      },
    });
  };

  const handleBasculerPaie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemboursement) return;

    const rembId = selectedRemboursement.id;
    const montant = formatCurrency(selectedRemboursement.montantNetRembourse);

    void runAction({
      confirm: {
        title: "Basculer ce remboursement sur le bulletin de paie ?",
        message: `Le montant de ${montant} sera automatiquement injecté comme indemnité nette non imposable sur le cycle de paie ${cyclePaie}.`,
        confirmLabel: "Confirmer la bascule",
        variant: "default",
      },
      loadingMessage: "Transfert vers le module Paie...",
      success: {
        title: "Remboursement transféré sur la paie",
        message: `Intégré sur le cycle ${cyclePaie}.`,
      },
      error: {
        title: "Erreur de transfert",
        message: "Impossible de basculer le remboursement sur la paie.",
      },
      action: async () => {
        await basculerSurBulletinPaie({
          id: rembId,
          periodePaieCible: cyclePaie,
        });
        setIsModalPaieOpen(false);
        setSelectedRemboursement(null);
      },
    });
  };

  const handleCreateCarte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carteEmployeId) return;

    void runAction({
      loadingMessage: "Création de la carte d'affaires...",
      success: {
        title: "Carte d'affaires enregistrée",
        message: `${carteEmetteur} (**** ${carteNumero})`,
      },
      error: {
        title: "Erreur d'enregistrement",
        message: "Impossible d'enregistrer la carte d'affaires.",
      },
      action: async () => {
        await ndfApi.createCarteAffaire({
          employeRefId: carteEmployeId,
          numeroMasque: carteNumero,
          emetteur: carteEmetteur,
          plafondMensuel: Number(cartePlafond),
        });
        setIsModalCarteOpen(false);
        await fetchCartes();
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
            Remboursements & Cartes Affaires
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exécution des règlements, intégration paie M4 et rapprochement bancaire des cartes d'entreprise
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("REMBOURSEMENTS")}
          className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "REMBOURSEMENTS"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <IconCash className="size-4" />
          <span>Ordres de Remboursement ({remboursements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("CARTES")}
          className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 px-4 ${
            activeTab === "CARTES"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <IconCreditCard className="size-4" />
          <span>Cartes Affaires & Rapprochement ({cartes.length})</span>
        </button>
      </div>

      {/* Vue Remboursements */}
      {activeTab === "REMBOURSEMENTS" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">N° Note de Frais</th>
                  <th className="px-4 py-3 font-semibold">Salarié</th>
                  <th className="px-4 py-3 font-semibold">Mode Choisi</th>
                  <th className="px-4 py-3 font-semibold text-right">Montant</th>
                  <th className="px-4 py-3 font-semibold">Date Règlement</th>
                  <th className="px-4 py-3 font-semibold">Réf. Virement / Cycle</th>
                  <th className="px-4 py-3 font-semibold text-center">Statut</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Chargement des remboursements...
                    </td>
                  </tr>
                ) : remboursements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Aucun ordre de remboursement en attente.
                    </td>
                  </tr>
                ) : (
                  remboursements.map((remb) => (
                    <tr key={remb.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                        {remb.rapportFrais?.numeroRapport || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {remb.rapportFrais?.employe
                          ? `${remb.rapportFrais.employe.nom} ${remb.rapportFrais.employe.prenoms}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                        {remb.modeRemboursement === "INTEGRE_BULLETIN_PAIE"
                          ? "Intégration Bulletin Paie M4"
                          : "Virement Bancaire Séparé"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(remb.montant)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {remb.dateRemboursement
                          ? new Date(remb.dateRemboursement).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                        {remb.referenceBancaire ||
                          remb.remboursementPaieTransmis?.periodePaieCible ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            remb.statut === "PAYE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {remb.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {remb.statut === "A_PAYER" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRemboursement(remb);
                                setIsModalPayOpen(true);
                              }}
                              className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Payer par virement
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRemboursement(remb);
                                setIsModalPaieOpen(true);
                              }}
                              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                              Bascule Paie M4
                            </button>
                          </div>
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

      {/* Vue Cartes Affaires */}
      {activeTab === "CARTES" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (employes.length > 0 && !carteEmployeId) setCarteEmployeId(employes[0].id);
                setIsModalCarteOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600"
            >
              <span>+ Enregistrer une Carte Affaire</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cartes.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    {c.emetteur || "Carte Affaire NEXERA"}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {c.statut}
                  </span>
                </div>

                <div className="my-6 text-xl font-mono tracking-widest text-gray-100">
                  •••• •••• •••• {c.numeroMasque}
                </div>

                <div className="flex justify-between items-end border-t border-gray-700 pt-3 text-xs">
                  <div>
                    <span className="text-gray-400">Titulaire</span>
                    <p className="font-semibold">{c.employe?.nom} {c.employe?.prenoms}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400">Plafond</span>
                    <p className="font-bold text-emerald-400">{formatCurrency(c.plafondMensuel)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Payer par Virement */}
      {isModalPayOpen && selectedRemboursement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Enregistrer le Règlement du Remboursement
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Montant à verser : <strong>{formatCurrency(selectedRemboursement.montant)}</strong>
            </p>
            <form onSubmit={handlePayer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date effective du virement *
                </label>
                <input
                  type="date"
                  required
                  value={datePaiement}
                  onChange={(e) => setDatePaiement(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Référence bancaire de transaction *
                </label>
                <input
                  type="text"
                  required
                  value={refBancaire}
                  onChange={(e) => setRefBancaire(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-mono text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalPayOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Confirmer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bascule Paie */}
      {isModalPaieOpen && selectedRemboursement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Basculer sur le Bulletin de Paie M4
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Le montant de <strong>{formatCurrency(selectedRemboursement.montant)}</strong> sera ajouté comme indemnité non imposable sur le bulletin.
            </p>
            <form onSubmit={handleBasculerPaie} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Cycle de paie cible (YYYY-MM) *
                </label>
                <input
                  type="month"
                  required
                  value={cyclePaie}
                  onChange={(e) => setCyclePaie(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalPaieOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
                >
                  Transmettre à la Paie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Créer Carte */}
      {isModalCarteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Enregistrer une Carte Affaire
            </h3>
            <form onSubmit={handleCreateCarte} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Collaborateur Porteur *
                </label>
                <select
                  required
                  value={carteEmployeId}
                  onChange={(e) => setCarteEmployeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.matricule} - {e.nom} {e.prenoms}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  4 Derniers chiffres du numéro *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={carteNumero}
                  onChange={(e) => setCarteNumero(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-mono text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Banque / Émetteur
                </label>
                <input
                  type="text"
                  value={carteEmetteur}
                  onChange={(e) => setCarteEmetteur(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Plafond Mensuel (FCFA)
                </label>
                <input
                  type="number"
                  value={cartePlafond}
                  onChange={(e) => setCartePlafond(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalCarteOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
                >
                  Enregistrer la carte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
