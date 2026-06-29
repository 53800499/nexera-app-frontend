"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { ErrorBoundary } from "@/shared/components/feedback";
import { RequireEntrepriseWorkspace } from "@/modules/auth/components/RequireEntrepriseWorkspace";
import { CrmOfflineProvider } from "@/modules/crm/offline/components/CrmOfflineProvider";
import { QuotationsOfflineProvider } from "@/modules/devis/offline/components/QuotationsOfflineProvider";
import { OrdersOfflineProvider } from "@/modules/commandes/offline/components/OrdersOfflineProvider";
import { InvoicesOfflineProvider } from "@/modules/factures/offline/components/InvoicesOfflineProvider";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <RequireEntrepriseWorkspace>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <CrmOfflineProvider>
              <QuotationsOfflineProvider>
                <OrdersOfflineProvider>
                  <InvoicesOfflineProvider>
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </InvoicesOfflineProvider>
                </OrdersOfflineProvider>
              </QuotationsOfflineProvider>
            </CrmOfflineProvider>
          </div>
        </div>
      </div>
    </RequireEntrepriseWorkspace>
  );
}
