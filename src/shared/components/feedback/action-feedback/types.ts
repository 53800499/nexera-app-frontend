export type ActionConfirmVariant = "default" | "danger" | "warning";

export type ActionResultVariant = "success" | "error";

export type ActionConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ActionConfirmVariant;
};

export type ActionResultOptions = {
  variant: ActionResultVariant;
  title: string;
  message?: string;
  closeLabel?: string;
};

export type RunActionOptions<T> = {
  confirm?: ActionConfirmOptions;
  loadingMessage?: string;
  success?: {
    title: string;
    message?: string;
  };
  error?: {
    title?: string;
    message?: string;
  };
  showResultOnSuccess?: boolean;
  showResultOnError?: boolean;
  /** Relance l'erreur après fermeture du loader (pour gestion dans un formulaire). */
  rethrowOnError?: boolean;
  /** Redirection après succès (une fois la modale de résultat fermée). */
  redirectTo?: string | ((result: T) => string);
  redirectMessage?: string;
  action: () => Promise<T>;
};

export type ConfirmDialogState = ActionConfirmOptions & {
  isOpen: boolean;
  resolve?: (confirmed: boolean) => void;
};

export type ResultDialogState = ActionResultOptions & {
  isOpen: boolean;
  resolve?: () => void;
};

export type ActionFeedbackState = {
  confirmDialog: ConfirmDialogState | null;
  loadingCount: number;
  loadingMessage: string | null;
  resultDialog: ResultDialogState | null;
  isRedirecting: boolean;
  redirectMessage: string | null;
  redirectFromPath: string | null;
};
