"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isVagueErrorMessage,
  resolveFormErrorMessage,
} from "@/shared/http/resolveFormErrorMessage";
import { useActionFeedbackStore } from "./actionFeedbackStore";
import type {
  ActionConfirmOptions,
  ActionResultOptions,
  RunActionOptions,
} from "./types";

export function useActionFeedback() {
  const router = useRouter();
  const pathname = usePathname();

  const confirm = useCallback((options: ActionConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      useActionFeedbackStore.getState().openConfirm(options, resolve);
    });
  }, []);

  const showResult = useCallback((options: ActionResultOptions): Promise<void> => {
    return new Promise((resolve) => {
      useActionFeedbackStore.getState().openResult(options, resolve);
    });
  }, []);

  const redirectWithLoader = useCallback(
    (href: string, message = "Redirection en cours...") => {
      const store = useActionFeedbackStore.getState();
      store.startRedirect(message, pathname);
      router.push(href);
    },
    [pathname, router],
  );

  const runAction = useCallback(
    async <T,>(options: RunActionOptions<T>): Promise<T | undefined> => {
      const store = useActionFeedbackStore.getState();

      if (options.confirm) {
        const confirmed = await confirm(options.confirm);
        if (!confirmed) return undefined;
      }

      store.startLoading(options.loadingMessage ?? "Action en cours...");

      try {
        const result = await options.action();
        store.stopLoading();

        if (options.showResultOnSuccess !== false) {
          await showResult({
            variant: "success",
            title: options.success?.title ?? "Action réussie",
            message: options.success?.message,
          });
        }

        if (result !== undefined && options.redirectTo) {
          const href =
            typeof options.redirectTo === "function"
              ? options.redirectTo(result)
              : options.redirectTo;
          redirectWithLoader(
            href,
            options.redirectMessage ?? "Redirection en cours...",
          );
        }

        return result;
      } catch (error) {
        store.stopLoading();

        const resolvedMessage = resolveFormErrorMessage(error);
        const errorMessage = isVagueErrorMessage(resolvedMessage)
          ? (options.error?.message ?? resolvedMessage)
          : resolvedMessage;

        if (options.showResultOnError !== false) {
          await showResult({
            variant: "error",
            title: options.error?.title ?? "Action échouée",
            message: errorMessage,
          });
        }

        if (options.rethrowOnError) {
          throw error;
        }

        return undefined;
      }
    },
    [confirm, redirectWithLoader, showResult],
  );

  const isLoading = useActionFeedbackStore((state) => state.loadingCount > 0);
  const isRedirecting = useActionFeedbackStore((state) => state.isRedirecting);

  return {
    confirm,
    showResult,
    runAction,
    redirectWithLoader,
    isLoading,
    isRedirecting,
    isBusy: isLoading || isRedirecting,
  };
}
