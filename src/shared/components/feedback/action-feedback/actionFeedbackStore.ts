import { create } from "zustand";
import type {
  ActionConfirmOptions,
  ActionResultOptions,
  ConfirmDialogState,
  ResultDialogState,
} from "./types";

type ActionFeedbackStore = {
  confirmDialog: ConfirmDialogState | null;
  loadingCount: number;
  loadingMessage: string | null;
  resultDialog: ResultDialogState | null;
  isRedirecting: boolean;
  redirectMessage: string | null;
  redirectFromPath: string | null;
  openConfirm: (
    options: ActionConfirmOptions,
    resolve: (confirmed: boolean) => void,
  ) => void;
  closeConfirm: (confirmed: boolean) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  startRedirect: (message?: string, fromPath?: string) => void;
  stopRedirect: () => void;
  openResult: (options: ActionResultOptions, resolve?: () => void) => void;
  closeResult: () => void;
};

const defaultConfirmLabels = {
  confirmLabel: "Confirmer",
  cancelLabel: "Annuler",
};

export const useActionFeedbackStore = create<ActionFeedbackStore>((set, get) => ({
  confirmDialog: null,
  loadingCount: 0,
  loadingMessage: null,
  resultDialog: null,
  isRedirecting: false,
  redirectMessage: null,
  redirectFromPath: null,

  openConfirm: (options, resolve) => {
    set({
      confirmDialog: {
        ...defaultConfirmLabels,
        variant: "default",
        ...options,
        isOpen: true,
        resolve,
      },
    });
  },

  closeConfirm: (confirmed) => {
    const { confirmDialog } = get();
    confirmDialog?.resolve?.(confirmed);
    set({ confirmDialog: null });
  },

  startLoading: (message) => {
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      loadingMessage: message ?? state.loadingMessage ?? "Action en cours...",
    }));
  },

  stopLoading: () => {
    set((state) => {
      const nextCount = Math.max(0, state.loadingCount - 1);
      return {
        loadingCount: nextCount,
        loadingMessage: nextCount === 0 ? null : state.loadingMessage,
      };
    });
  },

  startRedirect: (message, fromPath) => {
    set({
      isRedirecting: true,
      redirectMessage: message ?? "Redirection en cours...",
      redirectFromPath:
        fromPath ??
        (typeof window !== "undefined" ? window.location.pathname : null),
    });
  },

  stopRedirect: () => {
    set({
      isRedirecting: false,
      redirectMessage: null,
      redirectFromPath: null,
    });
  },

  openResult: (options, resolve) => {
    set({
      resultDialog: {
        closeLabel: "Fermer",
        ...options,
        isOpen: true,
        resolve,
      },
    });
  },

  closeResult: () => {
    const { resultDialog } = get();
    resultDialog?.resolve?.();
    set({ resultDialog: null });
  },
}));
