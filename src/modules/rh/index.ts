// Barrel export pour le module RH & Paie (NEXERA ERP)

// Pages
export { default as RhDashboardPage } from "./pages/RhDashboardPage";
export { default as EmployesListPage } from "./pages/EmployesListPage";
export { default as ContratsListPage } from "./pages/ContratsListPage";
export { default as TempsAbsencesPage } from "./pages/TempsAbsencesPage";
export { default as CyclesPaieListPage } from "./pages/CyclesPaieListPage";
export { default as CyclePaieDetailsPage } from "./pages/CyclePaieDetailsPage";
export { default as BulletinsListPage } from "./pages/BulletinsListPage";
export { default as SoldeToutComptePage } from "./pages/SoldeToutComptePage";
export { default as DeclarationsFiscalesPage } from "./pages/DeclarationsFiscalesPage";
export { default as EcrituresComptablesPaiePage } from "./pages/EcrituresComptablesPaiePage";
export { default as ParametresRhPage } from "./pages/ParametresRhPage";

// Hooks
export * from "./hooks/useRhAccess";
export * from "./hooks/useRhDashboard";
export * from "./hooks/useEmployes";
export * from "./hooks/useContrats";
export * from "./hooks/useTempsAbsences";
export * from "./hooks/usePaie";

// Services
export * from "./services/rhApi.service";

// Schemas & Types
export * from "./schemas/rh.schemas";
export * from "./types/rh.types";

// Utils
export * from "./utils/rhFormatters";
