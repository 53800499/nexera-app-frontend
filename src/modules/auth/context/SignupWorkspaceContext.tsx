"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NexeraLogoWorkspace } from "@/components/brand/NexeraLogo";

type SignupWorkspaceContextValue = {
  workspace: NexeraLogoWorkspace;
  setWorkspace: (workspace: NexeraLogoWorkspace) => void;
};

const SignupWorkspaceContext = createContext<SignupWorkspaceContextValue | null>(
  null,
);

export function SignupWorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<NexeraLogoWorkspace>("entreprise");
  const value = useMemo(
    () => ({ workspace, setWorkspace }),
    [workspace],
  );

  return (
    <SignupWorkspaceContext.Provider value={value}>
      {children}
    </SignupWorkspaceContext.Provider>
  );
}

export function useSignupWorkspace() {
  return useContext(SignupWorkspaceContext);
}
