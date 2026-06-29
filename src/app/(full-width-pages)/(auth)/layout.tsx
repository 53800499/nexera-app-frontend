import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { AuthBrandPanel } from "@/components/brand/AuthBrandPanel";
import { SignupWorkspaceProvider } from "@/modules/auth/context/SignupWorkspaceContext";

import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <SignupWorkspaceProvider>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            {children}
            <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
              <div className="relative items-center justify-center  flex z-1">
                <GridShape />
                <AuthBrandPanel />
              </div>
            </div>
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </SignupWorkspaceProvider>
      </ThemeProvider>
    </div>
  );
}
