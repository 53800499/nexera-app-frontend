import { create } from "zustand";
import type { Toast, ToastInput } from "./types";

const DEFAULT_DURATION = 4500;

type ToastState = {
  toasts: Toast[];
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? createId();
    const next: Toast = {
      id,
      duration: DEFAULT_DURATION,
      ...toast,
    };

    set((state) => ({ toasts: [...state.toasts, next] }));

    if (next.duration && next.duration > 0) {
      window.setTimeout(() => {
        get().dismiss(id);
      }, next.duration);
    }

    return id;
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clear: () => set({ toasts: [] }),
}));
