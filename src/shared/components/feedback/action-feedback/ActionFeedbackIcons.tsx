import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ActionConfirmVariant, ActionResultVariant } from "./types";

type IconProps = {
  className?: string;
};

function BlobBackground({
  fillClass,
  children,
}: {
  fillClass: string;
  children: ReactNode;
}) {
  return (
    <div className="relative mb-7 flex items-center justify-center">
      <svg
        className={fillClass}
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z" />
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </span>
    </div>
  );
}

export function SuccessResultIcon({ className }: IconProps) {
  return (
    <BlobBackground fillClass="fill-success-50 dark:fill-success-500/15">
      <svg
        className={cn("fill-success-600 dark:fill-success-500", className)}
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.25 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z"
        />
      </svg>
    </BlobBackground>
  );
}

export function ErrorResultIcon({ className }: IconProps) {
  return (
    <BlobBackground fillClass="fill-error-50 dark:fill-error-500/15">
      <svg
        className={cn("fill-error-600 dark:fill-error-500", className)}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 2.66669C8.6362 2.66669 2.66669 8.6362 2.66669 16C2.66669 23.3638 8.6362 29.3334 16 29.3334C23.3638 29.3334 29.3334 23.3638 29.3334 16C29.3334 8.6362 23.3638 2.66669 16 2.66669ZM20.4714 11.5286C20.7317 11.7889 20.7317 12.2111 20.4714 12.4714L17.9428 15L20.4714 17.5286C20.7317 17.7889 20.7317 18.2111 20.4714 18.4714C20.2111 18.7317 19.7889 18.7317 19.5286 18.4714L17 15.9428L14.4714 18.4714C14.2111 18.7317 13.7889 18.7317 13.5286 18.4714C13.2682 18.2111 13.2682 17.7889 13.5286 17.5286L16.0572 15L13.5286 12.4714C13.2682 12.2111 13.2682 11.7889 13.5286 11.5286C13.7889 11.2682 14.2111 11.2682 14.4714 11.5286L17 14.0572L19.5286 11.5286C19.7889 11.2682 20.2111 11.2682 20.4714 11.5286Z"
        />
      </svg>
    </BlobBackground>
  );
}

export function WarningConfirmIcon({ className }: IconProps) {
  return (
    <BlobBackground fillClass="fill-warning-50 dark:fill-warning-500/15">
      <svg
        className={cn("fill-warning-600 dark:fill-warning-500", className)}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 3.33331C9.55672 3.33331 4.33331 8.55672 4.33331 15C4.33331 21.4433 9.55672 26.6666 16 26.6666C22.4433 26.6666 27.6666 21.4433 27.6666 15C27.6666 8.55672 22.4433 3.33331 16 3.33331ZM15 9.66665C15 9.11437 15.4477 8.66665 16 8.66665C16.5523 8.66665 17 9.11437 17 9.66665V15.6666C17 16.219 16.5523 16.6666 16 16.6666C15.4477 16.6666 15 16.219 15 15.6666V9.66665ZM16 20.3333C15.4477 20.3333 15 19.8856 15 19.3333C15 18.781 15.4477 18.3333 16 18.3333C16.5523 18.3333 17 18.781 17 19.3333C17 19.8856 16.5523 20.3333 16 20.3333Z"
        />
      </svg>
    </BlobBackground>
  );
}

export function DangerConfirmIcon({ className }: IconProps) {
  return (
    <BlobBackground fillClass="fill-error-50 dark:fill-error-500/15">
      <svg
        className={cn("fill-error-600 dark:fill-error-500", className)}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 3.33331C9.55672 3.33331 4.33331 8.55672 4.33331 15C4.33331 21.4433 9.55672 26.6666 16 26.6666C22.4433 26.6666 27.6666 21.4433 27.6666 15C27.6666 8.55672 22.4433 3.33331 16 3.33331ZM15 9.66665C15 9.11437 15.4477 8.66665 16 8.66665C16.5523 8.66665 17 9.11437 17 9.66665V15.6666C17 16.219 16.5523 16.6666 16 16.6666C15.4477 16.6666 15 16.219 15 15.6666V9.66665ZM16 20.3333C15.4477 20.3333 15 19.8856 15 19.3333C15 18.781 15.4477 18.3333 16 18.3333C16.5523 18.3333 17 18.781 17 19.3333C17 19.8856 16.5523 20.3333 16 20.3333Z"
        />
      </svg>
    </BlobBackground>
  );
}

export function ConfirmIcon({ variant }: { variant: ActionConfirmVariant }) {
  if (variant === "danger") return <DangerConfirmIcon />;
  if (variant === "warning") return <WarningConfirmIcon />;
  return <WarningConfirmIcon />;
}

export function ResultIcon({ variant }: { variant: ActionResultVariant }) {
  if (variant === "error") return <ErrorResultIcon />;
  return <SuccessResultIcon />;
}
