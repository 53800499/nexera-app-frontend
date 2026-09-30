"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { HELP_ARTICLES, HelpArticle } from "@/modules/help-center";

export default function AidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeGuide, setActiveGuide] = useState<HelpArticle | null>(HELP_ARTICLES[0]);

  const filteredGuides = HELP_ARTICLES.filter((g) => {
    const matchCat = selectedCategory === "all" || g.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchCat;

    const matchTitle = g.title.toLowerCase().includes(query);
    const matchSummary = g.summary.toLowerCase().includes(query);
    const matchCatLabel = g.categoryLabel.toLowerCase().includes(query);
    const matchLegal = (g.legalRef || "").toLowerCase().includes(query);
    const matchTags = (g.tags || []).some((t) => t.toLowerCase().includes(query));
    const matchSteps = g.steps.some(
      (s) => s.title.toLowerCase().includes(query) || s.content.toLowerCase().includes(query)
    );

    return matchCat && (matchTitle || matchSummary || matchCatLabel || matchLegal || matchTags || matchSteps);
  });

  const countFiscalite = HELP_ARTICLES.filter((g) => g.category === "fiscalite").length;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Centre d'Aide & Guides Utilisateur" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Documentation as Code • Référentiel 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/30 text-amber-100 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              🏛️ Module 7 Fiscalité : 10 Chapitres Complets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Centre d&apos;Aide &amp; Manuels Pratiques Nexera
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Consultez les procédures détaillées étape par étape, les fondements légaux (CGI Bénin 2026, OHADA, Arrêté 1085-C) et accédez directement aux écrans opérationnels de l&apos;ERP.
          </p>

          <div className="pt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé (ex : TVA, IS, AIB, Patente, FEC, 1085-C, pénalités, paie...)"
                className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="absolute left-3.5 top-3.5 text-gray-400 text-base">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 text-xs text-gray-500 hover:text-gray-800 bg-gray-200 px-2 py-1 rounded"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {[
          { key: "all", label: `Tous les guides (${HELP_ARTICLES.length})` },
          { key: "fiscalite", label: `🏛️ Fiscalité & Déclarations (${countFiscalite})` },
          { key: "facturation", label: "🧾 Facturation & Ventes" },
          { key: "stock", label: "📦 Stocks" },
          { key: "paie", label: "👥 RH & Paie" },
          { key: "frais", label: "💳 Notes de Frais" },
          { key: "crm", label: "🤝 CRM & Clients" },
          { key: "cabinet", label: "⚖️ Cabinet M6" },
          { key: "rapports", label: "📊 Rapports & BI" },
          { key: "demarrage", label: "🚀 Prise en Main" },
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guides Navigation List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            <span>{filteredGuides.length} Guide(s) trouvé(s)</span>
            {selectedCategory === "fiscalite" && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Suite Module 7 Complète
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredGuides.map((guide) => {
              const isSelected = activeGuide?.id === guide.id;
              return (
                <div
                  key={guide.id}
                  onClick={() => setActiveGuide(guide)}
                  className={`cursor-pointer rounded-xl border p-4 transition text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 shadow-sm dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {guide.chapterNumber && (
                        <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[10px]">
                          {guide.chapterNumber}
                        </span>
                      )}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {guide.categoryLabel}
                      </span>
                    </div>
                    <span>⏱️ {guide.readTime}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                    {guide.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {guide.summary}
                  </p>

                  {guide.legalRef && (
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                      <span>⚖️ {guide.legalRef}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGuides.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                Aucun guide ne correspond à votre recherche &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>

        {/* Guide Content Interactive Reader */}
        <div className="lg:col-span-7">
          {activeGuide ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-800 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {activeGuide.chapterNumber && (
                      <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded text-xs">
                        {activeGuide.chapterNumber}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {activeGuide.categoryLabel}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-xs text-gray-500">⏱️ {activeGuide.readTime}</span>
                  </div>

                  {activeGuide.route && (
                    <Link
                      href={activeGuide.route}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40 transition"
                    >
                      <span>Accéder à l&apos;écran : {activeGuide.route}</span>
                      <span>&rarr;</span>
                    </Link>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {activeGuide.title}
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {activeGuide.summary}
                </p>

                {activeGuide.legalRef && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-100 dark:border-gray-700/60 flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-base">⚖️</span>
                    <div>
                      <span className="font-bold">Référence légale &amp; normative : </span>
                      <span className="font-mono text-gray-900 dark:text-white">{activeGuide.legalRef}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Procédure Opérationnelle Étape par Étape
                </h3>
                {activeGuide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-1.5"
                  >
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pl-8 whitespace-pre-line">
                      {step.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              {activeGuide.tips && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0">💡</span>
                    <div>
                      <span className="font-bold">Bon à savoir / Bonnes Pratiques : </span>
                      {activeGuide.tips}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Alert */}
              {activeGuide.warning && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div>
                      <span className="font-bold">Point de vigilance légale : </span>
                      {activeGuide.warning}
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeGuide.faq && activeGuide.faq.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Questions Fréquentes
                  </h3>
                  {activeGuide.faq.map((item, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-lg border border-gray-200 p-3.5 dark:border-gray-800 dark:bg-gray-800/20 space-y-1"
                    >
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        Q: {item.q}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        R: {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Link to Documentation as Code */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>Documentation as Code • Nexera ERP 2026</span>
                {activeGuide.route && (
                  <Link
                    href={activeGuide.route}
                    className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Ouvrir l&apos;écran {activeGuide.route} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
              Sélectionnez un guide à gauche pour afficher le pas-à-pas complet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
