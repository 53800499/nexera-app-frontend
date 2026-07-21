"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NexeraLogo } from "@/components/brand/NexeraLogo";
import { useSidebar } from "../context/SidebarContext";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useAppNavigation } from "./navigation/useAppNavigation";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";
import type { ResolvedNavItem } from "./navigation/types";

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    openSubmenu,
    toggleSubmenu,
    openSubmenuFor,
    closeSubmenu,
  } = useSidebar();
  const pathname = usePathname();
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const { mainItems, isCabinetWorkspace } = useAppNavigation();
  const navItems = isSessionReady ? mainItems : [];
  const homeHref = isCabinetWorkspace ? "/cabinet" : "/";

  const isPathActive = (path: string) => {
    if (path === "/cabinet") return pathname === "/cabinet";
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isItemActive = (nav: ResolvedNavItem) => {
    if (nav.subItems?.length) {
      return nav.subItems.some((sub) => isPathActive(sub.path));
    }
    return isPathActive(nav.path);
  };

  useEffect(() => {
    const match = navItems.find((nav) =>
      nav.subItems?.some((sub) => isPathActive(sub.path)),
    );
    if (match) openSubmenuFor(match.name);
    else closeSubmenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, navItems.length]);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 border-l-4 border-l-brand-500 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex flex-col py-8 ${
          !isExpanded && !isHovered ? "lg:items-center" : "items-start"
        }`}
      >
        <Link href={homeHref} className="block">
          {showLabels ? (
            <NexeraLogo showContext={isSessionReady} />
          ) : (
            <NexeraLogo variant="compact" showContext={false} />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {showLabels ? "Menu" : <HorizontaLDots />}
              </h2>
              <ul className="flex flex-col gap-1">
                {navItems.map((nav) => {
                  const active = isItemActive(nav);
                  const hasSub = Boolean(nav.subItems?.length);
                  const isOpen = openSubmenu === nav.name;

                  if (hasSub) {
                    return (
                      <li key={nav.name}>
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(nav.name)}
                          className={`menu-item group w-full ${
                            active
                              ? "menu-item-active"
                              : "menu-item-inactive"
                          }`}
                        >
                          <span
                            className={
                              active
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            }
                          >
                            {nav.icon}
                          </span>
                          {showLabels ? (
                            <>
                              <span className="menu-item-text flex-1 text-left">
                                {nav.name}
                              </span>
                              <ChevronDownIcon
                                className={`ml-auto size-5 transition-transform duration-200 ${
                                  isOpen
                                    ? "menu-item-arrow-active"
                                    : "menu-item-arrow-inactive"
                                }`}
                              />
                            </>
                          ) : null}
                        </button>
                        {showLabels && isOpen ? (
                          <ul className="mt-1 space-y-1 pl-9">
                            {nav.subItems!.map((sub) => {
                              const subActive = isPathActive(sub.path);
                              return (
                                <li key={sub.path}>
                                  <Link
                                    href={sub.path}
                                    className={`menu-dropdown-item ${
                                      subActive
                                        ? "menu-dropdown-item-active"
                                        : "menu-dropdown-item-inactive"
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  }

                  return (
                    <li key={nav.name}>
                      <Link
                        href={nav.path}
                        onClick={closeSubmenu}
                        className={`menu-item group ${
                          active
                            ? "menu-item-active"
                            : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={
                            active
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }
                        >
                          {nav.icon}
                        </span>
                        {showLabels ? (
                          <span className="menu-item-text">{nav.name}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
