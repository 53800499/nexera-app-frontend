"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { CrmSyncStatusBadge } from "@/modules/crm/offline";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { QuotationsSyncStatusBadge } from "@/modules/devis/offline/components/QuotationsSyncStatusBadge";
import { OrdersSyncStatusBadge } from "@/modules/commandes/offline/components/OrdersSyncStatusBadge";
import { InvoicesSyncStatusBadge } from "@/modules/factures/offline/components/InvoicesSyncStatusBadge";
import { useSidebar } from "@/context/SidebarContext";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { WORKSPACE_TYPES } from "@/modules/auth/types/user.types";
import { NexeraLogo } from "@/components/brand/NexeraLogo";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { WorkspaceContextBanners } from "./WorkspaceContextBanners";
import { GlobalSearchModal } from "@/modules/search";
import { useHelpDrawer } from "@/modules/help-center";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useAuthStore((s) => s.user);
  const isCabinetWorkspace = user?.workspace === WORKSPACE_TYPES.CABINET;
  const homeHref = isCabinetWorkspace ? "/cabinet" : "/";
  const { toggleHelp, isOpen: isHelpOpen } = useHelpDrawer();

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchModalOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-9 flex w-full flex-col border-gray-200 bg-white lg:border-b dark:border-gray-800 dark:bg-gray-900">
      <WorkspaceContextBanners />
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:border-b-0 lg:px-0 lg:py-4 dark:border-gray-800">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="z-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:flex lg:h-11 lg:w-11 dark:border-gray-800 dark:text-gray-400"
              onClick={handleToggle}
              aria-label="Basculer le menu"
            >
              {isMobileOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            <Link href={homeHref} className="shrink-0 lg:hidden">
              <NexeraLogo showContext />
            </Link>

          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Rechercher dans tout le système"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleApplicationMenu}
              aria-label="Ouvrir le menu d'applications"
              className="z-99999 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <div className="hidden lg:block">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="shadow-theme-xs group relative flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-transparent py-2.5 pr-3 pl-11 text-left text-sm text-gray-400 transition-colors hover:border-brand-300 hover:text-gray-600 xl:w-[360px] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:text-gray-200"
            >
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 group-hover:text-brand-500 dark:text-gray-500 dark:group-hover:text-brand-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="truncate pr-2">Rechercher dans tout le système...</span>
              <kbd className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 shadow-xs dark:border-gray-800 dark:bg-white/[0.05] dark:text-gray-400">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </button>
          </div>
        </div>

        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >

          <div className="flex items-center gap-2 2xsm:gap-3">
            {!isCabinetWorkspace ? (
              <>
                <CrmSyncStatusBadge />
                <QuotationsSyncStatusBadge />
                <OrdersSyncStatusBadge />
                <InvoicesSyncStatusBadge />
              </>
            ) : null}
            <ThemeToggleButton />
            <NotificationDropdown />
            <button
              type="button"
              onClick={toggleHelp}
              title="Centre d'aide et assistance contextuelle (Écran actuel)"
              aria-label="Centre d'aide et assistance contextuelle"
              aria-expanded={isHelpOpen}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${isHelpOpen
                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300 shadow-sm"
                  : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
          <UserDropdown />
        </div>
      </div>

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setSearchModalOpen(false);
          setSearchQuery("");
        }}
        initialQuery={searchQuery}
      />
    </header>
  );
};

export default AppHeader;
