import type { NavItemConfig } from "./types";
import {
  canReadCabinet,
  canReadSettings,
  hasPermissionCode,
  PERMISSION_CODES,
} from "@/modules/auth/utils/permissionCodes";
import type { AuthUser } from "@/modules/auth/types/auth.types";

export type CabinetNavPermissions = {
  cockpit: boolean;
  dossiers: boolean;
  missions: boolean;
  calendrier: boolean;
  supervision: boolean;
  validations: boolean;
  honoraires: boolean;
  communication: boolean;
  collaborateurs: boolean;
  deontologie: boolean;
  users: boolean;
  settings: boolean;
};

export function getCabinetNavPermissions(
  user: Pick<AuthUser, "permissions"> | null | undefined,
): CabinetNavPermissions {
  const permissionsUser = user ?? null;
  const canCabinet = canReadCabinet(permissionsUser);
  return {
    cockpit: canCabinet,
    dossiers: canCabinet,
    missions: canCabinet,
    calendrier: canCabinet,
    supervision: canCabinet,
    validations: canCabinet,
    honoraires: canCabinet,
    communication: canCabinet,
    collaborateurs: canCabinet,
    deontologie: canCabinet,
    users: hasPermissionCode(permissionsUser, PERMISSION_CODES.MANAGE_USERS),
    settings: canReadSettings(permissionsUser),
  };
}

export const CABINET_NAV_CONFIG: NavItemConfig<CabinetNavPermissions>[] = [
  {
    id: "cockpit",
    name: "Cockpit",
    iconKey: "grid",
    path: "/cabinet",
    canAccess: (p) => p.cockpit,
  },
  {
    id: "dossiers",
    name: "Portefeuille & Mandats",
    iconKey: "group",
    path: "/cabinet/dossiers",
    canAccess: (p) => p.dossiers,
  },
  {
    id: "missions",
    name: "Missions & Tâches",
    iconKey: "task",
    path: "/cabinet/missions",
    canAccess: (p) => p.missions,
  },
  {
    id: "calendrier",
    name: "Calendrier Consolidé",
    iconKey: "chart",
    path: "/cabinet/calendrier",
    canAccess: (p) => p.calendrier,
  },
  {
    id: "supervision",
    name: "Supervision & Revue",
    iconKey: "docs",
    path: "/cabinet/supervision",
    canAccess: (p) => p.supervision,
  },
  {
    id: "validations",
    name: "Validations & Visas",
    iconKey: "file",
    path: "/cabinet/validations",
    canAccess: (p) => p.validations,
  },
  {
    id: "honoraires",
    name: "Temps & Honoraires",
    iconKey: "dollar",
    path: "/cabinet/honoraires",
    canAccess: (p) => p.honoraires,
  },
  {
    id: "communication",
    name: "Demandes & Échanges",
    iconKey: "bell",
    path: "/cabinet/communication",
    canAccess: (p) => p.communication,
  },
  {
    id: "collaborateurs",
    name: "Équipe & Habilitations",
    iconKey: "group",
    path: "/cabinet/collaborateurs",
    canAccess: (p) => p.collaborateurs,
  },
  {
    id: "deontologie",
    name: "Déontologie & Secret Pro",
    iconKey: "lock",
    path: "/cabinet/deontologie",
    canAccess: (p) => p.deontologie,
  },
  {
    id: "profile",
    name: "Mon Profil",
    iconKey: "user",
    path: "/profile",
    canAccess: () => true,
  },
  {
    id: "parametres",
    name: "Paramètres",
    iconKey: "plug",
    path: "/parametres",
    canAccess: (p) => p.settings,
    /* subItems: [
      { name: "Vue d'ensemble", path: "/parametres" },
      { name: "Fiche Cabinet", path: "/parametres/entreprise" },
      { name: "Code d'invitation", path: "/parametres/cabinet" },
      { name: "Devises", path: "/parametres/devises" },
    ], */
  },
];
