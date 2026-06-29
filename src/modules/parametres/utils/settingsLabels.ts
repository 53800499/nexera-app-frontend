import type { DocumentType, EmailTemplateType } from "../types/settings.types";
import type { WorkspaceType } from "@/modules/auth/types/user.types";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  quotation: "Devis",
  order_draft: "Commande (brouillon)",
  order_issued: "Commande (émise)",
  invoice_draft: "Facture (brouillon)",
  invoice_issued: "Facture (émise)",
  client: "Client",
  catalog_item: "Article catalogue",
};

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  quotation_send: "Envoi de devis",
  invoice_send: "Envoi de facture",
  reminder_level_1: "Relance niveau 1",
  reminder_level_2: "Relance niveau 2",
  reminder_level_3: "Relance niveau 3",
  recurring_invoice: "Facture récurrente",
};

export type SettingsGroupId = "billing" | "documents" | "communication";

export type SettingsSection = {
  title: string;
  description: string;
  href: string;
  group: SettingsGroupId;
  groupLabel: string;
  /** Si défini, la section n'apparaît que pour ces espaces. */
  workspaces?: WorkspaceType[];
};

export const SETTINGS_GROUP_ORDER: SettingsGroupId[] = [
  "billing",
  "documents",
  "communication",
];

export const SETTINGS_GROUP_LABELS: Record<SettingsGroupId, string> = {
  billing: "Entreprise & facturation",
  documents: "Documents",
  communication: "Communication",
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: "Entreprise",
    description: "Identité légale, coordonnées et pénalités de retard",
    href: "/parametres/entreprise",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Cabinet comptable",
    description: "Autoriser votre expert-comptable à consulter vos dossiers",
    href: "/parametres/cabinet",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Identifiant cabinet",
    description: "Code d'invitation à transmettre à vos clients entreprise",
    href: "/parametres/cabinet",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.CABINET],
  },
  {
    title: "Taux de TVA",
    description: "Taux applicables et taux par défaut",
    href: "/parametres/taxes",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Conditions de paiement",
    description: "Délais et échéances par défaut",
    href: "/parametres/conditions-paiement",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Devises",
    description: "Devise principale et devises secondaires",
    href: "/parametres/devises",
    group: "billing",
    groupLabel: SETTINGS_GROUP_LABELS.billing,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Numérotation",
    description: "Préfixes, compteurs et format des documents",
    href: "/parametres/numerotation",
    group: "documents",
    groupLabel: SETTINGS_GROUP_LABELS.documents,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Modèle PDF",
    description: "Logo, couleurs et mentions légales",
    href: "/parametres/modele-pdf",
    group: "documents",
    groupLabel: SETTINGS_GROUP_LABELS.documents,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Modèles email",
    description: "Sujets et corps des emails automatiques",
    href: "/parametres/modeles-email",
    group: "communication",
    groupLabel: SETTINGS_GROUP_LABELS.communication,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
  {
    title: "Relances",
    description: "Seuils et activation des relances automatiques",
    href: "/parametres/relances",
    group: "communication",
    groupLabel: SETTINGS_GROUP_LABELS.communication,
    workspaces: [WORKSPACE_TYPES.ENTREPRISE],
  },
];

export function getSettingsSectionsForWorkspace(
  workspace: WorkspaceType | undefined,
): SettingsSection[] {
  const current = workspace ?? WORKSPACE_TYPES.ENTREPRISE;
  return SETTINGS_SECTIONS.filter(
    (section) =>
      !section.workspaces || section.workspaces.includes(current),
  );
}

export function getSettingsSectionsByGroupForWorkspace(
  workspace: WorkspaceType | undefined,
): Array<{
  id: SettingsGroupId;
  label: string;
  sections: SettingsSection[];
}> {
  const sections = getSettingsSectionsForWorkspace(workspace);
  return SETTINGS_GROUP_ORDER.map((id) => ({
    id,
    label: SETTINGS_GROUP_LABELS[id],
    sections: sections.filter((section) => section.group === id),
  })).filter((group) => group.sections.length > 0);
}

export function getSettingsSectionsByGroup(): Array<{
  id: SettingsGroupId;
  label: string;
  sections: SettingsSection[];
}> {
  return SETTINGS_GROUP_ORDER.map((id) => ({
    id,
    label: SETTINGS_GROUP_LABELS[id],
    sections: SETTINGS_SECTIONS.filter((section) => section.group === id),
  }));
}

export function getSettingsSectionByHref(
  href: string,
): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find((section) => section.href === href);
}
