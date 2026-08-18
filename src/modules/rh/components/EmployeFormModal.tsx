"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhDepartement, RhEmploye, RhEtablissement, RhPoste } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeToEdit?: RhEmploye | null;
}

export const EmployeFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  employeToEdit,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [etablissements, setEtablissements] = useState<RhEtablissement[]>([]);
  const [departements, setDepartements] = useState<RhDepartement[]>([]);
  const [postes, setPostes] = useState<RhPoste[]>([]);

  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    sexe: "M" as "M" | "F",
    situationFamiliale: "CELIBATAIRE",
    dateNaissance: "",
    dateEntreeEntreprise: new Date().toISOString().split("T")[0],
    emailProfessionnel: "",
    telephone1: "",
    npi: "",
    numeroCnss: "",
    numeroIfu: "",
    statutEmploi: "ACTIF",
    nombreEnfantsCharge: 0,
    etablissementId: "",
    departementId: "",
    posteId: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchDependencies = async () => {
    try {
      const [etabsRes, deptsRes, postsRes] = await Promise.all([
        rhApi.listEtablissements(),
        rhApi.listDepartements(),
        rhApi.listPostes(),
      ]);
      setEtablissements(Array.isArray(etabsRes) ? etabsRes : []);
      setDepartements(Array.isArray(deptsRes) ? deptsRes : []);
      setPostes(Array.isArray(postsRes) ? postsRes : []);
    } catch (err) {
      console.error("Erreur chargement listes référentiels:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (employeToEdit) {
        const currentAff = employeToEdit.affectations?.find((a) => a.estActuelle) || employeToEdit.affectations?.[0];
        setFormData({
          nom: employeToEdit.nom || "",
          prenoms: employeToEdit.prenoms || "",
          sexe: (employeToEdit.sexe as "M" | "F") || "M",
          situationFamiliale: employeToEdit.situationFamiliale || "CELIBATAIRE",
          dateNaissance: employeToEdit.dateNaissance ? employeToEdit.dateNaissance.split("T")[0] : "",
          dateEntreeEntreprise: employeToEdit.dateEntreeEntreprise
            ? employeToEdit.dateEntreeEntreprise.split("T")[0]
            : employeToEdit.dateEntree
            ? employeToEdit.dateEntree.split("T")[0]
            : new Date().toISOString().split("T")[0],
          emailProfessionnel: employeToEdit.emailProfessionnel || "",
          telephone1: employeToEdit.telephone1 || employeToEdit.telephonePrincipal || "",
          npi: employeToEdit.npi || "",
          numeroCnss: employeToEdit.numeroCnss || "",
          numeroIfu: employeToEdit.numeroIfu || "",
          statutEmploi: employeToEdit.statutEmploi || "ACTIF",
          nombreEnfantsCharge: employeToEdit.nombreEnfantsCharge || 0,
          etablissementId: currentAff?.etablissementId || "",
          departementId: currentAff?.departementId || "",
          posteId: currentAff?.posteId || "",
        });
      } else {
        setFormData({
          nom: "",
          prenoms: "",
          sexe: "M",
          situationFamiliale: "CELIBATAIRE",
          dateNaissance: "",
          dateEntreeEntreprise: new Date().toISOString().split("T")[0],
          emailProfessionnel: "",
          telephone1: "",
          npi: "",
          numeroCnss: "",
          numeroIfu: "",
          statutEmploi: "ACTIF",
          nombreEnfantsCharge: 0,
          etablissementId: "",
          departementId: "",
          posteId: "",
        });
      }
    }
  }, [isOpen, employeToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.prenoms.trim()) {
      toast.warning("Champs requis", "Le nom et les prénoms sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await runAction({
        loadingMessage: employeToEdit ? "Mise à jour du dossier collaborateur..." : "Création du dossier collaborateur...",
        success: {
          title: employeToEdit ? "Dossier mis à jour" : "Salarié enregistré avec succès",
          message: `${formData.prenoms} ${formData.nom} a été ${employeToEdit ? "mis à jour" : "créé dans le référentiel"}.`,
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer le salarié. Vérifiez les informations saisies.",
        },
        action: async () => {
          const payload = {
            nom: formData.nom.trim().toUpperCase(),
            prenoms: formData.prenoms.trim(),
            sexe: formData.sexe,
            situationFamiliale: formData.situationFamiliale,
            dateNaissance: formData.dateNaissance?.trim() ? formData.dateNaissance.trim() : undefined,
            dateEntreeEntreprise: formData.dateEntreeEntreprise || new Date().toISOString().split("T")[0],
            emailProfessionnel: formData.emailProfessionnel?.trim() ? formData.emailProfessionnel.trim() : undefined,
            telephone1: formData.telephone1?.trim() ? formData.telephone1.trim() : undefined,
            npi: formData.npi?.trim() ? formData.npi.trim() : undefined,
            numeroCnss: formData.numeroCnss?.trim() ? formData.numeroCnss.trim() : undefined,
            numeroIfu: formData.numeroIfu?.trim() ? formData.numeroIfu.trim() : undefined,
            statutEmploi: formData.statutEmploi || "ACTIF",
            nombreEnfantsCharge: Number(formData.nombreEnfantsCharge) || 0,
            etablissementId: formData.etablissementId || undefined,
            departementId: formData.departementId || undefined,
            posteId: formData.posteId || undefined,
          };

          if (employeToEdit) {
            await rhApi.updateEmploye(employeToEdit.id, payload);
          } else {
            await rhApi.createEmploye(payload);
          }
          onSuccess();
          onClose();
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const safeEtablissements = Array.isArray(etablissements) ? etablissements : [];
  const safeDepartements = Array.isArray(departements) ? departements : [];
  const safePostes = Array.isArray(postes) ? postes : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {employeToEdit ? `Modifier Salarié : ${employeToEdit.nom} ${employeToEdit.prenoms}` : "Nouveau Salarié"}
          </h2>
          <p className="text-xs text-gray-500">
            {employeToEdit
              ? `Matricule : ${employeToEdit.matricule}`
              : "Le matricule unique (EMP-XXXXXX) sera généré automatiquement par le système."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nom de famille *
            </label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden uppercase font-semibold"
              placeholder="Ex: MENSAH"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Prénoms *
            </label>
            <input
              type="text"
              required
              value={formData.prenoms}
              onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-medium"
              placeholder="Ex: Koffi Emmanuel"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sexe
            </label>
            <select
              value={formData.sexe}
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value as "M" | "F" })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Situation Familiale
            </label>
            <select
              value={formData.situationFamiliale}
              onChange={(e) => setFormData({ ...formData, situationFamiliale: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="CELIBATAIRE">Célibataire</option>
              <option value="MARIE">Marié(e)</option>
              <option value="DIVORCE">Divorcé(e)</option>
              <option value="VEUF">Veuf(ve)</option>
              <option value="PACS">Pacsé(e) / Union Légale</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date de Naissance
            </label>
            <input
              type="date"
              value={formData.dateNaissance}
              onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre d'Enfants à Charge
            </label>
            <input
              type="number"
              min={0}
              value={formData.nombreEnfantsCharge}
              onChange={(e) => setFormData({ ...formData, nombreEnfantsCharge: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date d'Entrée dans l'Entreprise *
            </label>
            <input
              type="date"
              required
              value={formData.dateEntreeEntreprise}
              onChange={(e) => setFormData({ ...formData, dateEntreeEntreprise: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Statut Collaborateur
            </label>
            <select
              value={formData.statutEmploi}
              onChange={(e) => setFormData({ ...formData, statutEmploi: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="ACTIF">Actif</option>
              <option value="EN_CONGE">En Congé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="DEMISSIONNE">Démissionné</option>
              <option value="LICENCIE">Licencié</option>
              <option value="RETRAITE">Retraité</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Professionnel
            </label>
            <input
              type="email"
              value={formData.emailProfessionnel}
              onChange={(e) => setFormData({ ...formData, emailProfessionnel: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="k.mensah@entreprise.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Téléphone Principal
            </label>
            <input
              type="tel"
              value={formData.telephone1}
              onChange={(e) => setFormData({ ...formData, telephone1: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="+229 97 00 00 00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              N° NPI (Identifiant Unique Bénin)
            </label>
            <input
              type="text"
              value={formData.npi}
              onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              N° CNSS
            </label>
            <input
              type="text"
              value={formData.numeroCnss}
              onChange={(e) => setFormData({ ...formData, numeroCnss: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="CNSS-123456"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              N° IFU
            </label>
            <input
              type="text"
              value={formData.numeroIfu}
              onChange={(e) => setFormData({ ...formData, numeroIfu: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="0202612345678"
            />
          </div>
        </div>

        {/* Affectation Initiale Optionnelle */}
        {safeEtablissements.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {employeToEdit ? "Affectation Actuelle" : "Affectation Initiale (Optionnel)"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-600 dark:text-gray-400">Établissement</label>
                <select
                  value={formData.etablissementId}
                  onChange={(e) => setFormData({ ...formData, etablissementId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                >
                  <option value="">-- Aucun --</option>
                  {safeEtablissements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.raisonSociale}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-600 dark:text-gray-400">Département</label>
                <select
                  value={formData.departementId}
                  onChange={(e) => setFormData({ ...formData, departementId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                >
                  <option value="">-- Aucun --</option>
                  {safeDepartements
                    .filter((d) => !formData.etablissementId || d.etablissementId === formData.etablissementId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.libelle}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-600 dark:text-gray-400">Poste</label>
                <select
                  value={formData.posteId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const selectedPoste = safePostes.find((p) => p.id === pId);
                    setFormData({
                      ...formData,
                      posteId: pId,
                      departementId: selectedPoste?.departementId || formData.departementId,
                      etablissementId:
                        selectedPoste?.departement?.etablissementId || formData.etablissementId,
                    });
                  }}
                  className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                >
                  <option value="">-- Aucun --</option>
                  {safePostes
                    .filter((p) => !formData.departementId || p.departementId === formData.departementId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.intitule}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading && (
              <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{loading ? "Enregistrement..." : employeToEdit ? "Mettre à Jour Salarié" : "Enregistrer Salarié"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
