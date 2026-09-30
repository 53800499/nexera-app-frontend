"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  GlobalSearchResponse,
  QuickActionItem,
  SearchCategoryFilter,
  SearchItemResult,
  SystemPageItem,
  UnifiedSearchResultItem,
} from "../types/search.types";
import { searchApi } from "../services/searchApi.service";
import {
  QUICK_ACTIONS,
  searchQuickActions,
  searchSystemPages,
  SYSTEM_PAGES,
} from "../utils/searchNavigationIndex";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const RECENT_SEARCHES_KEY = "nexera_global_recent_searches";

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [, startTransition] = useTransition();

  const [backendResults, setBackendResults] = useState<GlobalSearchResponse>({
    query: "",
    totalMatches: 0,
    clients: [],
    quotations: [],
    invoices: [],
    orders: [],
    catalogItems: [],
    employes: [],
  });

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronisation query initiale lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {
        // Ignorer erreur localStorage
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Sauvegarder un terme récent
  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignorer erreur localStorage
    }
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== termToRemove);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignorer
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignorer
    }
  };

  // Appel API déréférencé avec debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isOpen) return;

    if (trimmed.length < 2) {
      setBackendResults({
        query: trimmed,
        totalMatches: 0,
        clients: [],
        quotations: [],
        invoices: [],
        orders: [],
        catalogItems: [],
        employes: [],
      });
      setIsLoadingBackend(false);
      return;
    }

    setIsLoadingBackend(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch(trimmed);
        startTransition(() => {
          setBackendResults(res);
          setIsLoadingBackend(false);
        });
      } catch {
        setIsLoadingBackend(false);
      }
    }, 220);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, isOpen]);

  // Filtrage local immédiat des pages et actions
  const matchedPages: SystemPageItem[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchSystemPages(query);
  }, [query]);

  const matchedActions: QuickActionItem[] = useMemo(() => {
    if (!query.trim()) return QUICK_ACTIONS.slice(0, 5);
    return searchQuickActions(query);
  }, [query]);

  // Construction de la liste unifiée et catégorisée
  const unifiedResults: UnifiedSearchResultItem[] = useMemo(() => {
    const list: UnifiedSearchResultItem[] = [];
    const isSearching = query.trim().length > 0;

    // 1. Pages du système
    if (selectedCategory === "all" || selectedCategory === "pages") {
      matchedPages.forEach((p) => {
        list.push({
          id: p.id,
          type: "page",
          title: p.title,
          subtitle: p.description || p.path,
          categoryLabel: `Page • ${p.category}`,
          href: p.path,
          badge: "Menu",
          badgeVariant: "info",
        });
      });
    }

    // 2. Actions rapides
    if (selectedCategory === "all" || selectedCategory === "actions") {
      matchedActions.forEach((a) => {
        list.push({
          id: a.id,
          type: "action",
          title: a.title,
          subtitle: a.description,
          categoryLabel: "Action Rapide",
          href: a.path,
          badge: a.shortcut ? `Raccourci: ${a.shortcut}` : "Nouveau",
          badgeVariant: "success",
        });
      });
    }

    // Si on cherche du texte (2+ caractères), inclure les résultats backend
    if (isSearching) {
      // 3. Clients
      if (selectedCategory === "all" || selectedCategory === "clients") {
        backendResults.clients.forEach((c) => {
          list.push({
            ...c,
            type: "client",
            categoryLabel: "Client CRM",
          });
        });
      }

      // 4. Factures
      if (selectedCategory === "all" || selectedCategory === "invoices") {
        backendResults.invoices.forEach((i) => {
          list.push({
            ...i,
            type: "invoice",
            categoryLabel: "Facture Client",
          });
        });
      }

      // 5. Devis
      if (selectedCategory === "all" || selectedCategory === "quotations") {
        backendResults.quotations.forEach((q) => {
          list.push({
            ...q,
            type: "quotation",
            categoryLabel: "Devis Commercial",
          });
        });
      }

      // 6. Commandes
      if (selectedCategory === "all" || selectedCategory === "orders") {
        backendResults.orders.forEach((o) => {
          list.push({
            ...o,
            type: "order",
            categoryLabel: "Bon de Commande",
          });
        });
      }

      // 7. Catalogue
      if (selectedCategory === "all" || selectedCategory === "catalog") {
        backendResults.catalogItems.forEach((cat) => {
          list.push({
            ...cat,
            type: "catalog",
            categoryLabel: "Catalogue & Article",
          });
        });
      }

      // 8. Employés RH
      if (selectedCategory === "all" || selectedCategory === "rh") {
        backendResults.employes.forEach((emp) => {
          list.push({
            ...emp,
            type: "employe",
            categoryLabel: "Collaborateur RH",
          });
        });
      }
    }

    return list;
  }, [
    query,
    selectedCategory,
    matchedPages,
    matchedActions,
    backendResults,
  ]);

  // Ajustement de selectedIndex si hors limites
  useEffect(() => {
    if (selectedIndex >= unifiedResults.length) {
      setSelectedIndex(Math.max(0, unifiedResults.length - 1));
    }
  }, [unifiedResults.length, selectedIndex]);

  // Navigation vers un item
  const handleSelectItem = (item: UnifiedSearchResultItem) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onClose();
    router.push(item.href);
  };

  // Clavier : Flèches haut/bas, Entrée, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < unifiedResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, unifiedResults.length - 1)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (unifiedResults.length > 0 && unifiedResults[selectedIndex]) {
          handleSelectItem(unifiedResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, unifiedResults, selectedIndex]);

  // Faire défiler l'élément sélectionné dans la vue
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeElement = resultsContainerRef.current.querySelector(
        `[data-search-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Calcul des compteurs par catégorie
  const counts = {
    pages: matchedPages.length,
    actions: matchedActions.length,
    clients: backendResults.clients.length,
    invoices: backendResults.invoices.length,
    quotations: backendResults.quotations.length,
    orders: backendResults.orders.length,
    catalog: backendResults.catalogItems.length,
    rh: backendResults.employes.length,
  };

  const categories: { key: SearchCategoryFilter; label: string; count?: number }[] = [
    { key: "all", label: "Tous" },
    { key: "pages", label: "Pages", count: counts.pages },
    { key: "actions", label: "Actions", count: counts.actions },
    { key: "clients", label: "Clients", count: counts.clients },
    { key: "invoices", label: "Factures", count: counts.invoices },
    { key: "quotations", label: "Devis", count: counts.quotations },
    { key: "orders", label: "Commandes", count: counts.orders },
    { key: "catalog", label: "Articles", count: counts.catalog },
    { key: "rh", label: "RH & Paie", count: counts.rh },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
      className="fixed inset-0 z-99999 flex items-start justify-center bg-gray-900/60 p-3 pt-12 backdrop-blur-sm sm:p-6 sm:pt-20 dark:bg-black/80 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête : Input de recherche & boutons */}
        <div className="relative flex items-center border-b border-gray-200 px-4 py-3 sm:px-5 dark:border-gray-800">
          <span className="pointer-events-none mr-3 text-gray-400 dark:text-gray-500">
            {isLoadingBackend ? (
              <svg
                className="h-5 w-5 animate-spin text-brand-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une page, un client, un devis, une facture, un article, un salarié..."
            className="w-full bg-transparent text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-hidden dark:text-white dark:placeholder:text-gray-500"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="mr-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Effacer la recherche"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            ESC
          </button>
        </div>

        {/* Barre de filtres par catégories */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-100 bg-gray-50/60 px-4 py-2 scrollbar-none dark:border-gray-800 dark:bg-gray-900/60">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            const count = cat.count;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSelectedIndex(0);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{cat.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Corps de la fenêtre modale */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 scrollbar-thin dark:scrollbar-thumb-gray-700"
        >
          {/* État 1 : Requête vide - Affichage Recherches Récentes & Actions Rapides */}
          {!query.trim() && (
            <div className="space-y-4 p-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    <span>Recherches Récentes</span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Effacer tout
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          setSelectedIndex(0);
                        }}
                        className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-400"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions d'actions rapides par défaut */}
              <div>
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Actions Rapides Immédiates
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {QUICK_ACTIONS.slice(0, 6).map((action, idx) => (
                    <div
                      key={action.id}
                      onClick={() => handleSelectItem({
                        id: action.id,
                        type: "action",
                        title: action.title,
                        subtitle: action.description,
                        categoryLabel: "Action Rapide",
                        href: action.path,
                        badge: action.shortcut ? `Touche ${action.shortcut}` : "Nouveau",
                        badgeVariant: "success",
                      })}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                        selectedIndex === idx
                          ? "border-brand-500 bg-brand-50/60 dark:border-brand-500 dark:bg-brand-950/30"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {action.title}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {action.description}
                          </div>
                        </div>
                      </div>
                      {action.shortcut && (
                        <kbd className="hidden sm:inline-block rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          {action.shortcut}
                        </kbd>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages clés les plus consultées */}
              <div>
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Navigation Rapide
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_PAGES.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectItem({
                        id: p.id,
                        type: "page",
                        title: p.title,
                        subtitle: p.description || p.path,
                        categoryLabel: p.category,
                        href: p.path,
                      })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-500 hover:bg-white hover:text-brand-600 dark:border-gray-800 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                    >
                      {p.title.split(" - ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* État 2 : Résultats trouvés */}
          {unifiedResults.length > 0 && (
            <div className="space-y-1">
              {unifiedResults.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    data-search-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                      isSelected
                        ? "bg-brand-50 text-brand-900 shadow-xs ring-1 ring-brand-500/20 dark:bg-brand-950/40 dark:text-brand-100 dark:ring-brand-500/30"
                        : "text-gray-700 hover:bg-gray-100/70 dark:text-gray-200 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Icône selon le type */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          item.type === "page"
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                            : item.type === "action"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : item.type === "client"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : item.type === "invoice"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                            : item.type === "quotation"
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                            : item.type === "order"
                            ? "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400"
                            : item.type === "catalog"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                        }`}
                      >
                        {item.type === "page" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                        )}
                        {item.type === "action" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        {item.type === "client" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {item.type === "invoice" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {item.type === "quotation" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                        {item.type === "order" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        )}
                        {item.type === "catalog" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                        {item.type === "employe" && (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>

                      {/* Textes : Titre & Sous-titre */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            • {item.categoryLabel}
                          </span>
                        </div>
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Badge & Statut à droite */}
                    <div className="flex shrink-0 items-center gap-2 pl-3">
                      {item.badge && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            item.badgeVariant === "success"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : item.badgeVariant === "warning"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : item.badgeVariant === "danger"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800"
                              : item.badgeVariant === "info"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      <span
                        className={`text-xs opacity-0 transition-opacity group-hover:opacity-100 ${
                          isSelected ? "opacity-100 text-brand-600 dark:text-brand-400" : "text-gray-400"
                        }`}
                      >
                        ↵
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* État 3 : Aucun résultat */}
          {query.trim().length > 0 && unifiedResults.length === 0 && !isLoadingBackend && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Essayez un autre mot-clé, un numéro de facture/devis ou consultez la liste de nos pages disponibles.
              </p>
            </div>
          )}
        </div>

        {/* Pied de page : Raccourcis clavier */}
        <div className="flex flex-wrap items-center justify-between border-t border-gray-200 bg-gray-50/80 px-4 py-2.5 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-gray-700 dark:bg-gray-800">
                ↑
              </kbd>
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-gray-700 dark:bg-gray-800">
                ↓
              </kbd>
              <span>Naviguer</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-gray-700 dark:bg-gray-800">
                ↵
              </kbd>
              <span>Ouvrir</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-gray-700 dark:bg-gray-800">
                ESC
              </kbd>
              <span>Fermer</span>
            </span>
          </div>

          <div className="hidden sm:block text-[11px] text-gray-400">
            Recherche Nexera ERP • Transversale & Multi-entités
          </div>
        </div>
      </div>
    </div>
  );
};
