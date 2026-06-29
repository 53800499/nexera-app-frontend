import { cn } from "@/lib/utils";
import type { NexeraLogoWorkspace } from "./NexeraLogo";

type NexeraMarkProps = {
  size?: number;
  className?: string;
  /** Icône blanche sur fond de marque (sidebar réduite, favicon) */
  onBrand?: boolean;
  workspace?: NexeraLogoWorkspace;
};

/**
 * Sigle NEXERA : dossier comptable + monogramme N + courbe de croissance.
 * Pensé pour rester lisible de 16px à 64px.
 */
export function NexeraMark({
  size = 40,
  className,
  onBrand = false,
  workspace = "neutral",
}: NexeraMarkProps) {
  const accentClass =
    workspace === "cabinet" ? "text-cabinet-300" : "text-orange-400";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        className={onBrand ? "fill-white/15" : "fill-current opacity-[0.12]"}
      />

      {/* Coin dossier — expertise comptable */}
      <path
        d="M26 4h8a2 2 0 0 1 2 2v8"
        className={onBrand ? "stroke-white/40" : "stroke-current opacity-40"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Monogramme N */}
      <path
        d="M11 30V14M11 14l8.5 16M19.5 30V14"
        className={onBrand ? "stroke-white" : "stroke-current"}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Courbe de performance ERP */}
      <path
        d="M24 27l4-4 4 2 6-8"
        className={onBrand ? "stroke-white" : "stroke-current"}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Point d'accent — dynamique / alerte */}
      <circle
        cx="34"
        cy="17"
        r="2.25"
        className={onBrand ? "fill-orange-300" : cn("fill-current", accentClass)}
      />

      {/* Ligne de grand livre */}
      <path
        d="M9 33.5h22"
        className={onBrand ? "stroke-white/45" : "stroke-current opacity-35"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
