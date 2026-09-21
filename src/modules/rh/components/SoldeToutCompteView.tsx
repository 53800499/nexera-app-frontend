"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhEmploye, RhSoldeToutCompte } from "../types/rh.types";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast, ErrorState } from "@/shared/components/feedback";
import { DocsIcon, CheckCircleIcon, PencilIcon, PlusIcon } from "@/icons";
import { formatStcSignatureStatus } from "../utils/rhFormatters";

export const SoldeToutCompteView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [soldes, setSoldes] = useState<RhSoldeToutCompte[]>([]);
  const [employes, setEmployes] = useState<RhEmploye[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    employeId: "",
    dateEtablissement: new Date().toISOString().split("T")[0],
    montantDernierSalaireNet: 0,
    montantIndemnitePreavisNet: 0,
    montantIndemniteLicenciementNet: 0,
    montantIndemniteCongesPayesNet: 0,
    montantRetenuesDiverses: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resSettled, empsSettled] = await Promise.allSettled([
        rhApi.listSoldesToutCompte(),
        rhApi.listEmployes(),
      ]);
      const res = resSettled.status === "fulfilled" ? resSettled.value : [];
      const emps = empsSettled.status === "fulfilled" ? empsSettled.value : [];

      if (resSettled.status === "rejected" || empsSettled.status === "rejected") {
        const firstRejection = (resSettled.status === "rejected" ? resSettled : empsSettled) as PromiseRejectedResult;
        console.warn("Avertissement STC:", firstRejection.reason?.message || firstRejection.reason);
        setError(
          firstRejection.reason?.message ||
            "Serveur ou réseau indisponible. Impossible de récupérer tous les éléments.",
        );
      }

      const safeSoldesList = Array.isArray(res) ? res : ((res as any)?.data || []);
      const safeEmpsList = Array.isArray(emps) ? emps : ((emps as any)?.data || []);
      setSoldes(safeSoldesList);
      setEmployes(safeEmpsList);
      if (safeEmpsList.length > 0) {
        setForm((prev) => ({ ...prev, employeId: prev.employeId || safeEmpsList[0].id }));
      }
    } catch (err: any) {
      console.warn("Erreur STC:", err?.message || err);
      setError(err?.message || "Serveur ou réseau indisponible.");
      setSoldes([]);
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isCreateOpen) {
      loadData();
    }
  }, [isCreateOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeId) {
      toast.warning("Sélection requise", "Veuillez sélectionner un salarié.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: "Établissement du reçu pour solde de tout compte...",
        success: {
          title: "Solde de tout compte établi",
          message: "Le reçu libératoire et le décompte des indemnités ont été générés.",
        },
        error: {
          title: "Erreur de création",
          message: "Impossible d'établir le solde de tout compte. Vérifiez les informations saisies.",
        },
        action: async () => {
          await rhApi.createSoldeToutCompte(form);
          setIsCreateOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSign = async (id: string) => {
    await runAction({
      confirm: {
        title: "Signer le reçu pour solde de tout compte ?",
        message: "Cette action acte la signature sans réserve du reçu libératoire par le collaborateur sortant.",
        confirmLabel: "Signer sans réserve",
        variant: "warning",
      },
      loadingMessage: "Enregistrement de la signature...",
      success: {
        title: "Reçu signé",
        message: "Le reçu libératoire pour solde de tout compte a été validé et signé.",
      },
      error: {
        title: "Erreur de signature",
        message: "Impossible d'enregistrer la signature du reçu.",
      },
      action: async () => {
        await rhApi.signerSoldeToutCompte(id, {
          statutSignature: "SIGNE_SANS_RESERVE",
          recuPourSoldeSigne: true,
        });
        await loadData();
      },
    });
  };

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

  const safeSoldes = Array.isArray(soldes) ? soldes : [];
  const safeEmployes = Array.isArray(employes) ? employes : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Solde de Tout Compte & Certificats de Travail
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Règlements définitifs de fin de contrat, indemnités de rupture et reçus libératoires
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Établir un Solde de Tout Compte</span>
        </button>
      </div>

      {/* Barre d'état */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Documents de fin de contrat
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {safeSoldes.length} reçu(s) libératoire(s)
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

      {/* Tableau des Soldes de Tout Compte */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4 text-right">Dernier Salaire</th>
                <th className="px-6 py-4 text-right">Indemnité Licenciement</th>
                <th className="px-6 py-4 text-right">Indemnité Congés</th>
                <th className="px-6 py-4 text-right">Net Total Dû</th>
                <th className="px-6 py-4">Signature</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Chargement des soldes de tout compte...</p>
                  </td>
                </tr>
              ) : error && safeSoldes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6">
                    <ErrorState
                      title="Serveur ou réseau indisponible"
                      message={error}
                      onRetry={loadData}
                    />
                  </td>
                </tr>
              ) : safeSoldes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                      <DocsIcon className="h-6 w-6 shrink-0 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun reçu de solde de tout compte établi</p>
                    <p className="mt-1 text-xs text-gray-400">Établissez le règlement d'un contrat clôturé ou résilié.</p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
                    >
                      <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>Établir un Solde de Tout Compte</span>
                    </button>
                  </td>
                </tr>
              ) : (
                safeSoldes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {s.dateEtablissement ? new Date(s.dateEtablissement).toLocaleDateString("fr-FR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {s.employe?.nom} {s.employe?.prenoms}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {s.employe?.matricule}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">{formatCurrency(s.montantDernierSalaireNet)}</td>
                    <td className="px-6 py-4 text-right text-purple-600 font-mono font-medium">
                      {formatCurrency(s.montantIndemniteLicenciementNet)}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-mono font-medium">
                      {formatCurrency(s.montantIndemniteCongesPayesNet)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white font-mono text-base">
                      {formatCurrency(s.montantTotalNet)}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const sigInfo = formatStcSignatureStatus(s.statutSignature);
                        return (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sigInfo.badgeClass}`}>
                            {sigInfo.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/rh/comptabilite?tab=stc&stcId=${s.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors shadow-2xs"
                          title="Consulter l'écriture OD SYSCOHADA du solde de tout compte"
                        >
                          <DocsIcon className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                          <span>OD STC</span>
                        </a>
                        {s.statutSignature !== "SIGNE_SANS_RESERVE" ? (
                          <button
                            onClick={() => handleSign(s.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors"
                          >
                            <PencilIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>Signer</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                            <span>Clôturé</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création STC */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="max-w-xl p-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Établissement du Solde de Tout Compte
            </h2>
            <p className="text-xs text-gray-500">
              Calcul des indemnités de rupture et reçu pour solde libératoire
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Salarié *</label>
            <select
              required
              value={form.employeId}
              onChange={(e) => setForm({ ...form, employeId: e.target.value })}
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date d'Établissement *</label>
            <input
              type="date"
              required
              value={form.dateEtablissement}
              onChange={(e) => setForm({ ...form, dateEtablissement: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Dernier Salaire Net (FCFA)</label>
              <input
                type="number"
                min={0}
                value={form.montantDernierSalaireNet}
                onChange={(e) => setForm({ ...form, montantDernierSalaireNet: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Indemnité Préavis (FCFA)</label>
              <input
                type="number"
                min={0}
                value={form.montantIndemnitePreavisNet}
                onChange={(e) => setForm({ ...form, montantIndemnitePreavisNet: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Indemnité Licenciement (FCFA)</label>
              <input
                type="number"
                min={0}
                value={form.montantIndemniteLicenciementNet}
                onChange={(e) => setForm({ ...form, montantIndemniteLicenciementNet: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Indemnité Congés Payés (FCFA)</label>
              <input
                type="number"
                min={0}
                value={form.montantIndemniteCongesPayesNet}
                onChange={(e) => setForm({ ...form, montantIndemniteCongesPayesNet: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateOpen(false)}
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
              <span>{isSubmitting ? "Établissement..." : "Générer Solde de Tout Compte"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
