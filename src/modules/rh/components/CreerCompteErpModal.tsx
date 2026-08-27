"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { RhEmploye } from "../types/rh.types";
import { rhApi } from "../services/rhApi.service";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import {
  LockIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  CopyIcon,
  PlusIcon,
  UserIcon,
} from "@/icons";

interface CreerCompteErpModalProps {
  isOpen: boolean;
  onClose: () => void;
  employe: RhEmploye;
  onSuccess: () => void;
}

export const CreerCompteErpModal: React.FC<CreerCompteErpModalProps> = ({
  isOpen,
  onClose,
  employe,
  onSuccess,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [useAutoPassword, setUseAutoPassword] = useState(true);
  const [customPassword, setCustomPassword] = useState("");
  const [envoyerInvitation, setEnvoyerInvitation] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    initialPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(employe.emailProfessionnel || employe.emailPersonnel || "");
      setSelectedRoleIds([]);
      setUseAutoPassword(true);
      setCustomPassword("");
      setEnvoyerInvitation(true);
      setCreatedCredentials(null);
      setCopied(false);

      // Charger les rôles disponibles
      setLoadingRoles(true);
      rhApi
        .listRoles()
        .then((roles) => {
          if (Array.isArray(roles)) {
            setAvailableRoles(roles);
          }
        })
        .catch(() => {
          setAvailableRoles([]);
        })
        .finally(() => setLoadingRoles(false));
    }
  }, [isOpen, employe]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Identifiants ERP Nexera :\nEmail : ${createdCredentials.email}\nMot de passe : ${createdCredentials.initialPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copié !", "Les identifiants ont été copiés dans le presse-papiers.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.warning("Email requis", "Veuillez renseigner une adresse email valide.");
      return;
    }

    if (!useAutoPassword && !customPassword.trim()) {
      toast.warning("Mot de passe requis", "Veuillez définir un mot de passe ou choisir la génération automatique.");
      return;
    }

    await runAction({
      loadingMessage: "Création du compte utilisateur ERP et attribution des accès...",
      success: {
        title: "Compte ERP créé avec succès",
        message: `Le compte ${email} a été activé et associé à ${employe.prenoms} ${employe.nom}.`,
      },
      error: {
        title: "Erreur de création",
        message: "Impossible de créer le compte utilisateur ERP.",
      },
      action: async () => {
        const res = await rhApi.creerCompteUtilisateur(employe.id, {
          email: email.trim(),
          roleIds: selectedRoleIds,
          password: useAutoPassword ? undefined : customPassword.trim(),
          envoyerInvitation,
        });

        if (res?.user) {
          setCreatedCredentials({
            email: res.user.email,
            initialPassword: res.user.initialPassword,
          });
        }
        onSuccess();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/50 shadow-inner">
            <LockIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Générer un Compte d'Accès ERP
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Associer un compte de connexion pour{" "}
              <strong className="text-gray-700 dark:text-gray-300">
                {employe.prenoms} {employe.nom}
              </strong>{" "}
              ({employe.matricule})
            </p>
          </div>
        </div>

        {/* Écran de succès avec identifiants */}
        {createdCredentials ? (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300 mb-3">
                <CheckCircleIcon className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                Compte Collaborateur Opérationnel !
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-md mx-auto">
                Le compte a été créé et relié au dossier RH. Le collaborateur peut désormais se connecter à Nexera.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-850 space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Identifiants de connexion générés
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="text-xs text-gray-400">Identifiant (Email)</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white truncate">
                    {createdCredentials.email}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="text-xs text-gray-400">Mot de passe temporaire</div>
                  <div className="font-mono font-bold text-brand-600 dark:text-brand-400 select-all">
                    {createdCredentials.initialPassword}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors shadow-xs"
                >
                  <CopyIcon className="h-4 w-4" />
                  <span>{copied ? "Identifiants Copiés !" : "Copier les identifiants"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Terminer
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de création */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email de connexion */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse Email de Connexion *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <EnvelopeIcon className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: prenom.nom@nexera.bj"
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Sert d'identifiant unique de connexion sur l'ERP.
              </p>
            </div>

            {/* Attribution des rôles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Habilitations & Rôles Applicatifs
                </label>
                <span className="text-2xs text-gray-400">
                  {selectedRoleIds.length} rôle(s) sélectionné(s)
                </span>
              </div>

              {loadingRoles ? (
                <div className="flex items-center justify-center p-6 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-400 animate-pulse">
                  Chargement des rôles du système...
                </div>
              ) : availableRoles.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-500 text-center">
                  Aucun rôle personnalisé défini. Le compte aura les droits standards par défaut.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {availableRoles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 shadow-2xs"
                            : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 dark:border-gray-800 dark:bg-gray-850/50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRole(role.id)}
                          className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 dark:bg-gray-800"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="font-semibold truncate">{role.name || role.code}</div>
                          {role.description && (
                            <div className="text-2xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                              {role.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mot de passe */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-850/50 space-y-3">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sécurité & Mot de passe
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passwordMode"
                    checked={useAutoPassword}
                    onChange={() => setUseAutoPassword(true)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Générer automatiquement un mot de passe sécurisé (Recommandé)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passwordMode"
                    checked={!useAutoPassword}
                    onChange={() => setUseAutoPassword(false)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Définir manuellement le mot de passe initial
                  </span>
                </label>
              </div>

              {!useAutoPassword && (
                <div className="pt-2">
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Saisissez un mot de passe robuste..."
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 shadow-xs transition-all active:scale-[0.98]"
              >
                <UserIcon className="h-4 w-4" />
                <span>Créer et Activer le Compte</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
