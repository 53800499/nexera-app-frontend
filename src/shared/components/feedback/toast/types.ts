export type ToastVariant = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
};

export type ToastInput = Omit<Toast, "id"> & { id?: string };
