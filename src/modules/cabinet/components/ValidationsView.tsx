"use client";

import React, { useState } from "react";
import { useValidations } from "../hooks/useValidations";
import { ErrorState, LoadingBlock, useToast } from "@/shared/components/feedback";
import { AppError } from "@/shared/core/AppError";
import { RequireCabinetAccess } from "./RequireCabinetAccess";
import type {
  CabinetCircuitValidation,
  CabinetDecisionValidation,
  CabinetMethodeSignature,
} from "../types/cabinet.types";
import {
  formatObjetMetier,
  formatRoleCode,
  formatDecisionValidation,
  formatMethodeSignature,
} from "../utils/cabinetLabels";

export function ValidationsView() {
  const toast = useToast();
  const {
    circuitsQuery,
    submitValidationMutation,
    apposeSignatureMutation,
  } = useValidations();

  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Visa decision state
  const [circuitId, setCircuitId] = useState("");
  const [visaObjetType, setVisaObjetType] = useState("rh_cycle_paie");
  const [visaObjetId, setVisaObjetId] = useState("");
  const [decision, setDecision] = useState<CabinetDecisionValidation>("APPROUVE");
  const [commentaire, setCommentaire] = useState("");

  // Signature state
  const [sigObjetType, setSigObjetType] = useState("tax_liasse_fiscale");
  const [sigObjetId, setSigObjetId] = useState("");
  const [methode, setMethode] = useState<CabinetMethodeSignature>(
    "SIGNATURE_ELECTRONIQUE_QUALIFIEE",
  );
  const [empreinte, setEmpreinte] = useState(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );

  const circuits = circuitsQuery.data ?? [];

  const handleSubmitVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCircuitId = circuitId.trim();
    const cleanType = visaObjetType.trim();
    const cleanId = visaObjetId.trim();

    if (!cleanCircuitId || !cleanType || !cleanId) {
      toast.error("Veuillez renseigner le circuit, le type et l'identifiant de l'objet.");
      return;
    }

    try {
      await submitValidationMutation.mutateAsync({
        cabinetCircuitValidationId: cleanCircuitId,
        objetType: cleanType,
        objetId: cleanId,
        etapeOrdre: 1,
        decision,
        commentaire: commentaire.trim() || undefined,
      });

      toast.success("Décision de visa enregistrée avec succès.");
      setIsVisaModalOpen(false);
      setCommentaire("");
      setVisaObjetId("");
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Impossible d'enregistrer la décision de validation.";
      toast.error(message);
    }
  };

  const handleApposeSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanType = sigObjetType.trim();
    const cleanId = sigObjetId.trim();
    const cleanEmpreinte = empreinte.trim();

    if (!cleanType || !cleanId || !cleanEmpreinte) {
      toast.error("Veuillez renseigner le type d'objet, l'identifiant et l'empreinte.");
      return;
    }

    try {
      await apposeSignatureMutation.mutateAsync({
        objetType: cleanType,
        objetId: cleanId,
        methodeSignature: methode,
        empreinteDocument: cleanEmpreinte,
      });

      toast.success("Signature électronique apposée avec succès.");
      setIsSignatureModalOpen(false);
      setSigObjetId("");
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.message
          : "Impossible d'apposer la signature électronique.";
      toast.error(message);
    }
  };

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Validations, Visas & Signatures Électroniques
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Processus probants de validation hiérarchique et signature certifiée des livrables
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVisaModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-950/30"
            >
              + Apposer un Visa
            </button>
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none"
            >
              🔏 Signature Probante
            </button>
          </div>
        </div>

        {/* WORKFLOWS DE VALIDATION CONFIGURÉS */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Circuits de Validation Actifs
          </h2>
          <p className="text-xs text-gray-500">
            Étapes de visa requises avant délivrance aux tiers (Banques, Impôts, Dirigeants)
          </p>

          {circuitsQuery.isLoading ? (
            <LoadingBlock label="Chargement des circuits..." />
          ) : circuits.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">Aucun circuit configuré.</p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {circuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className="flex flex-col justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                        {formatObjetMetier(circuit.typeObjetCible)}
                      </span>
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {circuit.actif ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {circuit.etapes.map((e) => (
                        <div key={e.etape} className="flex items-start gap-2 text-xs">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                            {e.etape}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {e.libelle}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Rôle requis : {formatRoleCode(e.roleCode)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL APPOSER VISA */}
        {isVisaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Apposer une décision de visa / validation
              </h3>

              <form onSubmit={handleSubmitVisa} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Circuit de validation applicable *
                  </label>
                  <select
                    value={circuitId}
                    onChange={(e) => setCircuitId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Sélectionnez un circuit de validation...</option>
                    {circuits.map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatObjetMetier(c.typeObjetCible)} — ({c.etapes.length} étapes de visa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type d'objet métier *
                  </label>
                  <input
                    type="text"
                    value={visaObjetType}
                    onChange={(e) => setVisaObjetType(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    ID / Référence de l'objet métier *
                  </label>
                  <input
                    type="text"
                    value={visaObjetId}
                    onChange={(e) => setVisaObjetId(e.target.value)}
                    placeholder="Ex: b5f0535e-9a29-450f-9080-1a0678d4baec, rh_cycle_2026_08..."
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Décision de validation *
                  </label>
                  <select
                    value={decision}
                    onChange={(e) =>
                      setDecision(e.target.value as CabinetDecisionValidation)
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="APPROUVE">Approuvé (Bon pour émission / Clôture)</option>
                    <option value="RENVOYE_POUR_CORRECTION">
                      Renvoyé pour correction (Modifications requises)
                    </option>
                    <option value="REJETE">Rejeté (Non conforme)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Commentaire / Visa d'expert
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={2}
                    placeholder="Précisions éventuelles sur la validation..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVisaModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitValidationMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submitValidationMutation.isPending
                      ? "Enregistrement..."
                      : "Valider"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL SIGNATURE PROBANTE */}
        {isSignatureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Apposer une signature électronique certifiée
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Garantit l'intégrité, l'authenticité et la non-répudiation du document selon les normes OHADA / eIDAS.
              </p>

              <form onSubmit={handleApposeSignature} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type de document / Livrable *
                  </label>
                  <input
                    type="text"
                    value={sigObjetType}
                    onChange={(e) => setSigObjetType(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    ID / Référence du document *
                  </label>
                  <input
                    type="text"
                    value={sigObjetId}
                    onChange={(e) => setSigObjetId(e.target.value)}
                    placeholder="Ex: b5f0535e-9a29-450f-9080-1a0678d4baec, tax_liasse_2026..."
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Niveau de Signature *
                  </label>
                  <select
                    value={methode}
                    onChange={(e) =>
                      setMethode(e.target.value as CabinetMethodeSignature)
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="SIGNATURE_ELECTRONIQUE_QUALIFIEE">
                      Signature Électronique Qualifiée (Certificat eIDAS / RGS**)
                    </option>
                    <option value="SIGNATURE_ELECTRONIQUE_SIMPLE">
                      Signature Électronique Standard (Horodatage sécurisé)
                    </option>
                    <option value="SIGNATURE_MANUSCRITE_SCANNEE">
                      Signature Manuscrite Numérisée (Griffe cabinet)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Empreinte Numérique SHA-256 du document *
                  </label>
                  <input
                    type="text"
                    value={empreinte}
                    onChange={(e) => setEmpreinte(e.target.value)}
                    required
                    className="mt-1 block w-full font-mono rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={apposeSignatureMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {apposeSignatureMutation.isPending
                      ? "Signature en cours..."
                      : "Signer le Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireCabinetAccess>
  );
}
