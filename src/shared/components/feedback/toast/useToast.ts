"use client";

import { useToastStore } from "./toastStore";
import type { ToastInput } from "./types";

export function useToast() {
  const push = useToastStore((state) => state.push);
  const dismiss = useToastStore((state) => state.dismiss);
  const clear = useToastStore((state) => state.clear);

  return {
    toast: (input: ToastInput) => push(input),
    success: (title: string, description?: string) =>
      push({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      push({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      push({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      push({ title, description, variant: "info" }),
    dismiss,
    clear,
  };
}
