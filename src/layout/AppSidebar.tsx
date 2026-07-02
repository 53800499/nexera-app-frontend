"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NexeraLogo } from "@/components/brand/NexeraLogo";
import { useSidebar } from "../context/SidebarContext";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useAppNavigation } from "./navigation/useAppNavigation";
import { HorizontaLDots } from "../icons/index";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const user = useAuthStore((state) => state.user);
  const { mainItems, isCabinetWorkspace } = useAppNavigation();
  const navItems = isSessionReady ? mainItems : [];
  const homeHref = isCabinetWorkspace ? "/cabinet" : "/";

  const isActive = (path: string) => {
    if (path === "/cabinet") {
      return pathname === "/cabinet";
    }
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

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
          {isExpanded || isHovered || isMobileOpen ? (
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
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav) => (
                  <li key={nav.name}>
                    <Link
                      href={nav.path}
                      className={`menu-item group ${
                        isActive(nav.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={`${
                          isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
