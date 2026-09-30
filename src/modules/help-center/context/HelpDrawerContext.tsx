"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HelpArticle } from "../types/help-center.types";
import { HELP_ARTICLES, findContextualArticle } from "../data/help-guides.data";

interface HelpDrawerContextType {
  isOpen: boolean;
  activeArticle: HelpArticle | null;
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  toggleHelp: () => void;
  selectArticle: (articleId: string) => void;
}

const HelpDrawerContext = createContext<HelpDrawerContextType | undefined>(undefined);

export const HelpDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<HelpArticle | null>(() => {
    return findContextualArticle(pathname || "") || HELP_ARTICLES[0];
  });

  // Quand la route change et que le tiroir n'est pas explicitement forcé sur un article spécifique,
  // mettre à jour l'article contextuel actif
  useEffect(() => {
    if (pathname) {
      const contextual = findContextualArticle(pathname);
      if (contextual) {
        setActiveArticle(contextual);
      }
    }
  }, [pathname]);

  const openHelp = (articleId?: string) => {
    if (articleId) {
      const found = HELP_ARTICLES.find((a) => a.id === articleId);
      if (found) {
        setActiveArticle(found);
      }
    } else if (pathname) {
      const contextual = findContextualArticle(pathname);
      if (contextual) {
        setActiveArticle(contextual);
      }
    }
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
  };

  const toggleHelp = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openHelp();
    }
  };

  const selectArticle = (articleId: string) => {
    const found = HELP_ARTICLES.find((a) => a.id === articleId);
    if (found) {
      setActiveArticle(found);
    }
  };

  return (
    <HelpDrawerContext.Provider
      value={{
        isOpen,
        activeArticle,
        openHelp,
        closeHelp,
        toggleHelp,
        selectArticle,
      }}
    >
      {children}
    </HelpDrawerContext.Provider>
  );
};

export const useHelpDrawer = (): HelpDrawerContextType => {
  const context = useContext(HelpDrawerContext);
  if (!context) {
    throw new Error("useHelpDrawer must be used within a HelpDrawerProvider");
  }
  return context;
};
