export const STOCK_ENTRY_TYPE_LABELS: Record<string, string> = {
  IN_SUPPLIER: "Réception fournisseur",
  IN_RETURN: "Retour client",
  IN_PRODUCTION: "Production interne",
  IN_ADJUSTMENT: "Ajustement positif",
  IN_INITIAL: "Stock initial",
};

export const STOCK_EXIT_TYPE_LABELS: Record<string, string> = {
  OUT_SALE: "Sortie vente",
  OUT_CONSUMPTION: "Consommation interne",
  OUT_LOSS: "Perte / casse",
  OUT_RETURN_SUPPLIER: "Retour fournisseur",
  OUT_ADJUSTMENT: "Ajustement négatif",
};

export const STOCK_MOVEMENT_TYPE_LABELS: Record<string, string> = {
  ...STOCK_ENTRY_TYPE_LABELS,
  ...STOCK_EXIT_TYPE_LABELS,
};

export const STOCK_QUALITY_LABELS: Record<string, string> = {
  accepted: "Accepté",
  partial: "Accepté avec réserves",
  rejected: "Refusé",
};

export const STOCK_MOVEMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  validated: "Validé",
  cancelled: "Annulé",
};
