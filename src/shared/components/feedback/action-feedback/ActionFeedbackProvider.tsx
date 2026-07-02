"use client";

import { ActionConfirmDialog } from "./ActionConfirmDialog";
import { ActionLoadingOverlay } from "./ActionLoadingOverlay";
import { ActionRedirectWatcher } from "./ActionRedirectWatcher";
import { ActionResultDialog } from "./ActionResultDialog";

export function ActionFeedbackProvider() {
  return (
    <>
      <ActionRedirectWatcher />
      <ActionConfirmDialog />
      <ActionLoadingOverlay />
      <ActionResultDialog />
    </>
  );
}
