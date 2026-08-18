import { z } from "zod";

export const createEmployeSchema = z.object({
  etablissementId: z.string().min(1, "L'établissement est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  prenoms: z.string().min(1, "Le prénom est requis"),
  genre: z.enum(["MASCULIN", "FEMININ", "AUTRE"]),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  lieuNaissance: z.string().optional(),
  nationaliteCode: z.string().default("BJ"),
  situationMatrimoniale: z.enum([
    "CELIBATAIRE",
    "MARIE",
    "DIVORCE",
    "VEUF",
    "CONCUBINAGE",
  ]),
  nombreEnfantsACharge: z.number().int().min(0).default(0),
  numeroNpi: z.string().optional(),
  numeroSecuriteSociale: z.string().optional(),
  adresseLigne1: z.string().optional(),
  ville: z.string().default("Cotonou"),
  emailPersonnel: z.string().email("Email personnel invalide").optional().or(z.literal("")),
  emailProfessionnel: z.string().email("Email professionnel invalide").optional().or(z.literal("")),
  telephoneMobile: z.string().min(1, "Le téléphone mobile est requis"),
  dateEmbaucheInitiale: z.string().min(1, "La date d'embauche est requise"),
});

export type CreateEmployeInput = z.infer<typeof createEmployeSchema>;

export const createContratSchema = z.object({
  employeId: z.string().min(1, "L'employé est requis"),
  etablissementId: z.string().min(1, "L'établissement est requis"),
  departementId: z.string().optional(),
  posteId: z.string().optional(),
  typeContrat: z.enum([
    "CDI",
    "CDD",
    "STAGE_ECOLE",
    "STAGE_PROFESSIONNEL",
    "APPRENTISSAGE",
    "INTERIM",
    "PRESTATION",
  ]),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFinPrevue: z.string().optional(),
  salaireBaseMensuel: z.number().min(0, "Le salaire de base doit être positif"),
  surplusSalaire: z.number().min(0).default(0),
  modePaiement: z.enum(["VIREMENT", "MOBILE_MONEY", "CHEQUE", "ESPECES"]).default("VIREMENT"),
  dureeEssaiMois: z.number().int().min(0).max(6).optional(),
});

export type CreateContratInput = z.infer<typeof createContratSchema>;

export const createDemandeAbsenceSchema = z.object({
  employeId: z.string().min(1, "L'employé est requis"),
  typeAbsenceId: z.string().min(1, "Le type d'absence est requis"),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
  nombreJoursOuvres: z.number().min(0.5, "Le nombre de jours doit être d'au moins 0.5"),
  motif: z.string().optional(),
});

export type CreateDemandeAbsenceInput = z.infer<typeof createDemandeAbsenceSchema>;

export const createCyclePaieSchema = z.object({
  etablissementId: z.string().min(1, "L'établissement est requis"),
  annee: z.number().int().min(2020).max(2050),
  mois: z.number().int().min(1).max(12),
  datePaiementPrevue: z.string().optional(),
});

export type CreateCyclePaieInput = z.infer<typeof createCyclePaieSchema>;

export const createElementVariableSchema = z.object({
  employeId: z.string().min(1, "L'employé est requis"),
  rubriquePaieId: z.string().min(1, "La rubrique est requise"),
  montant: z.number().min(0, "Le montant doit être positif"),
  commentaire: z.string().optional(),
});

export type CreateElementVariableInput = z.infer<typeof createElementVariableSchema>;

export const createSoldeToutCompteSchema = z.object({
  employeId: z.string().min(1, "L'employé est requis"),
  dateEtablissement: z.string().min(1, "La date d'établissement est requise"),
  montantDernierSalaireNet: z.number().min(0).default(0),
  montantIndemnitePreavisNet: z.number().min(0).default(0),
  montantIndemniteLicenciementNet: z.number().min(0).default(0),
  montantIndemniteCongesPayesNet: z.number().min(0).default(0),
  montantRetenuesDiverses: z.number().min(0).default(0),
  observations: z.string().optional(),
});

export type CreateSoldeToutCompteInput = z.infer<typeof createSoldeToutCompteSchema>;
