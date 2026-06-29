"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";

type Props = {
  tenantId: string;
  label?: string;
};

export function CopyableTenantId({
  tenantId,
  label = "Identifiant organisation",
}: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tenantId);
      setCopied(true);
      toast.success("Identifiant copié dans le presse-papiers.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier l'identifiant.");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 break-all rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white/90">
          {tenantId}
        </code>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
    </div>
  );
}
