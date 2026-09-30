"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHelpDrawer } from "../context/HelpDrawerContext";
import { HELP_ARTICLES } from "../data/help-guides.data";

export const ContextualHelpDrawer: React.FC = () => {
  const { isOpen, activeArticle, closeHelp, selectArticle } = useHelpDrawer();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeHelp();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeHelp]);

  // Réinitialiser le feedback lors du changement d'article
  useEffect(() => {
    setFeedbackGiven(null);
    setOpenFaqIndex(null);
  }, [activeArticle?.id]);

  if (!isOpen) return null;

  const filteredArticles = searchQuery.trim()
    ? HELP_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-99999 overflow-hidden">
      {/* Backdrop sombre avec flou subtil */}
      <div
        onClick={closeHelp}
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Panneau latéral coulissant (Slide-Over) */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md sm:max-w-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out">
          {/* Header du Tiroir */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white font-bold backdrop-blur-md">
                  💡
                </span>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    Centre d&apos;Aide &amp; Assistance In-App
                  </h2>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Accompagnement opérationnel sans quitter votre travail
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href="/aide"
                  onClick={closeHelp}
                  title="Ouvrir le Centre d'Aide en plein écran"
                  className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25 transition text-xs flex items-center gap-1 font-semibold"
                >
                  <span>Plein écran</span>
                  <span className="text-sm">↗</span>
                </Link>
                <button
                  type="button"
                  onClick={closeHelp}
                  className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25 transition"
                  aria-label="Fermer le tiroir d'aide"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Badge de contexte de route active */}
            <div className="mt-3 flex items-center justify-between text-[11px] bg-black/20 rounded-md px-2.5 py-1 text-blue-100 font-mono">
              <span className="truncate">Écran actuel : {pathname || "/"}</span>
              <span className="text-[10px] text-amber-200 shrink-0 font-sans font-bold">Auto-détecté ✓</span>
            </div>
          </div>

          {/* Barre de Recherche Rapide In-Drawer */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une autre procédure (TVA, AIB, Patente, Paie...)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-9 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-[11px] text-gray-400 hover:text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Résultats de recherche en direct */}
            {searchQuery.trim() && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 text-xs">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        selectArticle(art.id);
                        setSearchQuery("");
                      }}
                      className="cursor-pointer p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span className="font-semibold text-blue-600">{art.categoryLabel}</span>
                        <span>⏱️ {art.readTime}</span>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{art.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-center text-gray-400">Aucun guide ne correspond à &ldquo;{searchQuery}&rdquo;</p>
                )}
              </div>
            )}
          </div>

          {/* Corps du Guide Utilisateur Actif */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {activeArticle ? (
              <>
                {/* En-tête de l'article */}
                <div className="space-y-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {activeArticle.chapterNumber && (
                      <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[11px]">
                        {activeArticle.chapterNumber}
                      </span>
                    )}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {activeArticle.categoryLabel}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-gray-500">⏱️ {activeArticle.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                    {activeArticle.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {activeArticle.summary}
                  </p>

                  {activeArticle.legalRef && (
                    <div className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2.5 border border-gray-100 dark:border-gray-700/60 flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                      <span className="text-sm">⚖️</span>
                      <div>
                        <span className="font-bold">Base légale : </span>
                        <span className="font-mono text-gray-900 dark:text-white">{activeArticle.legalRef}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Étapes Pas-à-Pas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mode Opératoire
                  </h4>
                  {activeArticle.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40 space-y-1"
                    >
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </h5>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed pl-7 whitespace-pre-line">
                        {step.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pro Tip */}
                {activeArticle.tips && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <span className="font-bold">Astuce : </span>
                      {activeArticle.tips}
                    </div>
                  </div>
                )}

                {/* Warning */}
                {activeArticle.warning && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 flex items-start gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <div>
                      <span className="font-bold">Vigilance légale : </span>
                      {activeArticle.warning}
                    </div>
                  </div>
                )}

                {/* FAQ Accordion */}
                {activeArticle.faq && activeArticle.faq.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Questions Fréquentes sur cet Écran
                    </h4>
                    {activeArticle.faq.map((item, fIdx) => {
                      const isFaqOpen = openFaqIndex === fIdx;
                      return (
                        <div
                          key={fIdx}
                          className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isFaqOpen ? null : fIdx)}
                            className="w-full text-left p-3 font-semibold text-gray-800 dark:text-gray-200 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                          >
                            <span>{item.q}</span>
                            <span className="text-gray-400 text-sm">{isFaqOpen ? "−" : "+"}</span>
                          </button>
                          {isFaqOpen && (
                            <div className="p-3 text-[11px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 leading-relaxed">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Feedback Widget */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-2 text-center">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Cet article vous a-t-il été utile ?
                  </p>
                  {feedbackGiven ? (
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <span>✓</span>
                      <span>Merci pour votre retour ! Votre avis nous aide à perfectionner Nexera.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFeedbackGiven("positive")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-xs"
                      >
                        <span>👍</span>
                        <span>Oui, parfaitement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackGiven("negative")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-xs"
                      >
                        <span>👎</span>
                        <span>Non, pas assez clair</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">
                Aucun article sélectionné.
              </div>
            )}
          </div>

          {/* Footer d'action rapide */}
          <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 flex items-center justify-between text-xs text-gray-500">
            <Link
              href="/aide"
              onClick={closeHelp}
              className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
            >
              <span>Centre d&apos;Aide complet</span>
              <span>&rarr;</span>
            </Link>
            <span className="text-[11px] text-gray-400">Nexera ERP • Référentiel 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
