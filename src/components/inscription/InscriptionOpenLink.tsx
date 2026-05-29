"use client";

import type { ReactNode } from "react";
import { useInscriptionModal } from "@/components/inscription/InscriptionModalProvider";

type InscriptionOpenLinkProps = {
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  tabIndex?: number;
};

export function InscriptionOpenLink({
  className,
  children,
  onNavigate,
  tabIndex,
}: InscriptionOpenLinkProps) {
  const { openInscriptionModal } = useInscriptionModal();

  return (
    <button
      type="button"
      className={className}
      tabIndex={tabIndex}
      onClick={() => {
        onNavigate?.();
        openInscriptionModal();
      }}
    >
      {children}
    </button>
  );
}
