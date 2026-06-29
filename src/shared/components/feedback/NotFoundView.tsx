"use client";

import Link from "next/link";
import GridShape from "@/components/common/GridShape";

type NotFoundViewProps = {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
};

export function NotFoundView({
  title = "Page introuvable",
  description = "La page que vous recherchez n'existe pas ou a été déplacée.",
  homeHref = "/",
  homeLabel = "Retour à l'accueil",
}: NotFoundViewProps) {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-nexera-surface)] p-6 dark:bg-gray-900">
      <GridShape />
      <div className="mx-auto w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-nexera-accent)]">
          Erreur 404
        </p>
        <h1 className="mt-3 text-7xl font-bold text-[var(--color-nexera-primary)] dark:text-white/90 sm:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-nexera-accent)] px-5 py-3 text-sm font-medium text-white hover:bg-orange-600"
          >
            {homeLabel}
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Se connecter
          </Link>
        </div>
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} NEXERA
      </p>
    </div>
  );
}
