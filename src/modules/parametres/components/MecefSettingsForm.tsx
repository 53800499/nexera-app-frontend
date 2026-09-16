"use client";

import { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import type {
  MecefConfig,
  UpdateMecefConfigPayload,
} from "@/modules/factures/types/invoice.types";

type Props = {
  config: MecefConfig;
  isSubmitting: boolean;
  readOnly?: boolean;
  onSubmit: (payload: UpdateMecefConfigPayload) => Promise<void>;
};

export function MecefSettingsForm({
  config,
  isSubmitting,
  readOnly = false,
  onSubmit,
}: Props) {
  const [apiUrl, setApiUrl] = useState(config.mecefApiUrl || config.apiUrl || "");
  const [apiKey, setApiKey] = useState("");
  const [nim, setNim] = useState(config.mecefNim || config.nim || "");
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    config.mecefEnvironment || config.environment || "sandbox",
  );
  const [autoNormalize, setAutoNormalize] = useState<boolean>(
    config.mecefAutoNormalize ?? config.autoNormalize ?? false,
  );
  const [showKey, setShowKey] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    setApiUrl(config.mecefApiUrl || config.apiUrl || "");
    setNim(config.mecefNim || config.nim || "");
    setEnvironment(config.mecefEnvironment || config.environment || "sandbox");
    setAutoNormalize(config.mecefAutoNormalize ?? config.autoNormalize ?? false);
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess(null);
    setFeedbackError(null);

    const payload: UpdateMecefConfigPayload = {
      mecefApiUrl: apiUrl.trim() || undefined,
      mecefNim: nim.trim() || undefined,
      mecefEnvironment: environment,
      mecefAutoNormalize: autoNormalize,
    };

    if (apiKey.trim()) {
      payload.mecefApiKey = apiKey.trim();
    }

    try {
      await onSubmit(payload);
      setApiKey("");
      setFeedbackSuccess("Configuration e-MECeF enregistrée avec succès.");
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: any) {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de la configuration e-MECeF.",
      );
    }
  };

  const isConfigured = Boolean(
    config.isConfigured || config.configured || (config.mecefNim && config.mecefApiUrl),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedbackSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300">
          ✅ {feedbackSuccess}
        </div>
      )}

      {feedbackError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300">
          ⚠️ {feedbackError}
        </div>
      )}

      {/* Carte Statut e-MECeF */}
      <ComponentCard
        title="Statut de l'Intégration Fiscale (DGI Bénin)"
        desc="État de la liaison avec le Système de Facturation Électronique (SFE / e-MECeF)."
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-3.5 w-3.5 rounded-full ${
                isConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isConfigured
                  ? "Paramètres e-MECeF opérationnels"
                  : "Configuration minimale incomplète"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mode actuel :{" "}
                <span className="font-semibold uppercase text-brand-600 dark:text-brand-400">
                  {environment === "production" ? "Production DGI Réelle" : "Sandbox (Bac à sable / Test)"}
                </span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isConfigured
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
          >
            {isConfigured ? "Prêt à certifier" : "À paramétrer"}
          </span>
        </div>
      </ComponentCard>

      {/* Paramètres de Connexion */}
      <ComponentCard
        title="Connexion API & Identifiants DGI"
        desc="Renseignez les accès officiels délivrés par la Direction Générale des Impôts du Bénin."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Environnement actif</Label>
              <select
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as "sandbox" | "production")
                }
                disabled={readOnly || isSubmitting}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="sandbox">Sandbox (Simulation de test locale)</option>
                <option value="production">Production (Serveur officiel DGI)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                En production, chaque facture émise est signée légalement auprès de la DGI.
              </p>
            </div>

            <div>
              <Label>NIM (Numéro d'Identification Machine)</Label>
              <Input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="ex. MC01000001 ou SFE01000001"
                disabled={readOnly || isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Le numéro attribué à votre entreprise par la DGI.
              </p>
            </div>
          </div>

          <div>
            <Label>URL de l'API e-MECeF (DGI)</Label>
            <Input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://ebf.impots.bj/api"
              disabled={readOnly || isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              L'URL de base du point de terminaison e-MECeF (ex. <code>https://ebf.impots.bj/api</code>).
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Clé API secrète / Token DGI</Label>
              {config.mecefApiKeyMasked && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  Clé actuelle : <code>{config.mecefApiKeyMasked}</code>
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  config.mecefApiKeyMasked
                    ? "Laissez vide pour conserver la clé actuelle"
                    : "Collez votre token / clé secrète délivré par la DGI"
                }
                disabled={readOnly || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showKey ? "Masquer" : "Afficher"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Jeton Bearer fourni par la DGI pour autoriser les signatures de factures.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoNormalize}
                onChange={(e) => setAutoNormalize(e.target.checked)}
                disabled={readOnly || isSubmitting}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Normalisation automatique lors de l'émission
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Si activé, chaque facture passant au statut <code>issued</code> sera immédiatement transmise à la DGI pour certification sans action manuelle supplémentaire.
                </p>
              </div>
            </label>
          </div>
        </div>
      </ComponentCard>

      {/* Guide Rapide Fiscalité Bénin */}
      <ComponentCard
        title="Rappel des Normes de Facturation Normalisée (Bénin)"
        desc="Directives officielles pour la conformité de vos factures."
      >
        <div className="grid grid-cols-1 gap-4 text-xs text-gray-600 dark:text-gray-300 md:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Groupes de Taxation (TVA)
            </h4>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Groupe A</strong> : Exonéré (0%)</li>
              <li>• <strong>Groupe B</strong> : Taxable standard (18%)</li>
              <li>• <strong>Groupe C</strong> : Exportation de biens/services (0%)</li>
              <li>• <strong>Groupe D</strong> : Régime d'exception (0%)</li>
              <li>• <strong>Groupe E</strong> : Régime fiscal synthétique (TPS)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              AIB (Acompte sur Impôt Assis sur les Bénéfices)
            </h4>
            <ul className="mt-2 space-y-1">
              <li>• <strong>AIB A (1%)</strong> : Client entreprise avec IFU valide</li>
              <li>• <strong>AIB B (5%)</strong> : Client particulier ou sans IFU</li>
              <li>• <strong>NONE (0%)</strong> : Pas d'acompte AIB applicable</li>
            </ul>
          </div>
        </div>
      </ComponentCard>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Enregistrement en cours..." : "Enregistrer les paramètres e-MECeF"}
          </Button>
        </div>
      )}
    </form>
  );
}
