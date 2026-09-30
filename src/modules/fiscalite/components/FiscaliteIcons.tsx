import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Icône emblème Fiscalité (Bouclier avec document & timbre fiscal)
 */
export const TaxBadgeIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 11h6" />
    <path d="M12 8v6" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

/**
 * Icône Calendrier & Échéancier Fiscal
 */
export const CalendarIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
    <circle cx="16" cy="18" r="1" fill="currentColor" />
  </svg>
);

/**
 * Icône Pourcentage / TVA
 */
export const PercentBadgeIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M19 5L5 19" />
    <circle cx="7" cy="7" r="2.5" />
    <circle cx="17" cy="17" r="2.5" />
  </svg>
);

/**
 * Icône Calculateur / Impôt sur les Sociétés (IS)
 */
export const CalculatorIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="3" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
    <line x1="8" y1="18" x2="10" y2="18" />
    <line x1="14" y1="18" x2="16" y2="18" />
  </svg>
);

/**
 * Icône Retenue à la source / AIB
 */
export const WithholdingTaxIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v12" />
    <path d="M15 9.5a3 3 0 0 0-3-2.5h-1a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 1 0 5h-1.5a3 3 0 0 1-3-2.5" />
    <path d="M18 15l3 3" />
  </svg>
);

/**
 * Icône Bâtiment Institutionnel / DGI / Patente
 */
export const LandmarkIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 21h18" />
    <path d="M5 21V10" />
    <path d="M9 21V10" />
    <path d="M15 21V10" />
    <path d="M19 21V10" />
    <path d="M2 10h20" />
    <path d="M12 3L2 10h20L12 3z" />
  </svg>
);

/**
 * Icône Liasse Fiscale / États Financiers SYSCOHADA
 */
export const LiasseFiscaleIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
    <path d="M2 8v12a2 2 0 0 0 2 2" />
  </svg>
);

/**
 * Icône Fichier FEC Homologué / Audit de Conformité
 */
export const FileAuditIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

/**
 * Icône Balance de la Justice / Contrôles & Contentieux
 */
export const ScaleJusticeIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3v18" />
    <path d="M6 7l6-3 6 3" />
    <path d="M6 7L3 14a3 3 0 0 0 6 0L6 7z" />
    <path d="M18 7l-3 7a3 3 0 0 0 6 0l-3-7z" />
    <path d="M8 21h8" />
  </svg>
);

/**
 * Icône Parchemin / Circulaires & Veille Réglementaire
 */
export const ScrollLegalIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M8 2h8a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
    <path d="M4 6h16" />
    <path d="M8 11h8" />
    <path d="M8 15h5" />
  </svg>
);

/**
 * Icône Synchronisation / Actualisation
 */
export const SyncIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M20.49 15a9 9 0 0 1-15.36 3.36L2.5 16" />
    <path d="M3.51 9a9 9 0 0 1 15.36-3.36L21.5 8" />
  </svg>
);

/**
 * Icône Imprimante
 */
export const PrinterIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </svg>
);

/**
 * Icône Paiement / Carte Bancaire
 */
export const CreditCardIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </svg>
);

/**
 * Icône Visa & Signature Cabinet
 */
export const SignatureIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20 19.5c-3.5 0-4-3-7-3s-3.5 2-6 2-3.5-1-4.5-1.5" />
    <path d="M18.5 3.5a2.121 2.121 0 0 1 3 3L11 17l-4 1 1-4 10.5-10.5z" />
  </svg>
);

/**
 * Icône Télétransmission / Envoi Dématérialisé DGI
 */
export const RocketSendIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.77 22.77 0 0 1-3.95 2L12 15z" />
    <path d="M9 12l2 2" />
  </svg>
);

/**
 * Icône Génération / Étincelle
 */
export const SparklesIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
    <path d="M6 6l3 3m6 6l3 3M6 18l3-3m6-6l3-3" />
  </svg>
);

/**
 * Icône Épingle / Régime Localisation
 */
export const MapPinIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/**
 * Icône Bâtiment Entreprise / Secteur d'activité
 */
export const BuildingIcon: React.FC<IconProps> = ({ className = "h-5 w-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="10" y2="6" />
    <line x1="14" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
  </svg>
);
