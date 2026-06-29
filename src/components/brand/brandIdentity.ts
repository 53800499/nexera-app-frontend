import type { Metadata } from "next";

export const CONTEXT_TAGLINE = "ERP & Expertise comptable";

export const brandIdentity = {
  name: "NEXERA",
  tagline: CONTEXT_TAGLINE,
  colors: {
    primary: "#1B3A6B",
    cabinet: "#4B0082",
    entreprise: "#1B3A6B",
    accent: "#E8552D",
    surface: "#F4F7FA",
  },
  mark: {
    path: "/images/brand/nexera-mark.svg",
    description:
      "Dossier comptable, monogramme N et courbe de croissance — sigle de la plateforme NEXERA.",
  },
} as const;

export const brandMetadata: Metadata = {
  applicationName: brandIdentity.name,
  title: {
    default: `${brandIdentity.name} — ${brandIdentity.tagline}`,
    template: `%s | ${brandIdentity.name}`,
  },
};
