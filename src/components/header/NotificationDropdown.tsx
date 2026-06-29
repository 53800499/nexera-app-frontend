"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotificationContext } from "@/layout/navigation/useNotificationContext";
import type { ContextualNotificationTone } from "@/layout/navigation/contextualNotifications";

const TONE_STYLES: Record<
  ContextualNotificationTone,
  { dot: string; icon: string }
> = {
  info: {
    dot: "bg-brand-500",
    icon: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  },
  warning: {
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  success: {
    dot: "bg-success-500",
    icon: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
  },
};

export default function NotificationDropdown() {
  const panel = useNotificationContext();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    setHasUnread(true);
    setIsOpen(false);
  }, [pathname]);

  if (!panel) return null;

  const hasItems = panel.items.length > 0;

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleOpen() {
    toggleDropdown();
    setHasUnread(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`${panel.title} — ${panel.moduleLabel}`}
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleOpen}
      >
        {hasItems && hasUnread ? (
          <span className="absolute top-0.5 right-0 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        ) : null}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-auto max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-start justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {panel.title}
            </h5>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Contexte : {panel.moduleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDropdown}
            aria-label="Fermer"
            className="dropdown-toggle text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {hasItems ? (
          <ul className="custom-scrollbar flex max-h-[340px] flex-col overflow-y-auto">
            {panel.items.map((notification) => {
              const tone = notification.tone ?? "info";
              const styles = TONE_STYLES[tone];

              return (
                <li key={notification.id}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    href={notification.href}
                    className="flex gap-3 rounded-lg border-b border-gray-100 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${styles.icon}`}
                    >
                      {(notification.tag ?? "•").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="block min-w-0">
                      <span className="mb-1 block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {notification.title}
                      </span>
                      <span className="block text-theme-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </span>
                      {notification.tag ? (
                        <span className="mt-1.5 flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                          />
                          <span>{notification.tag}</span>
                        </span>
                      ) : null}
                    </span>
                  </DropdownItem>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aucune alerte
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Rien à signaler pour {panel.moduleLabel.toLowerCase()}.
            </p>
          </div>
        )}

        {panel.viewAllHref ? (
          <Link
            href={panel.viewAllHref}
            onClick={closeDropdown}
            className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {panel.viewAllLabel ?? "Voir tout"}
          </Link>
        ) : null}
      </Dropdown>
    </div>
  );
}
