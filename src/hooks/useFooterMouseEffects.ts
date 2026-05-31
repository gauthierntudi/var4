"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useFooterMouseEffects<T extends HTMLElement>() {
  const footerRef = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || reducedMotion) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const handleMove = (event: MouseEvent) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = footer.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        footer.style.setProperty("--mouse-x", `${x}%`);
        footer.style.setProperty("--mouse-y", `${y}%`);
        footer.dataset.footerActive = "true";
      });
    };

    const handleLeave = () => {
      footer.style.setProperty("--mouse-x", "50%");
      footer.style.setProperty("--mouse-y", "50%");
      delete footer.dataset.footerActive;
    };

    footer.addEventListener("mousemove", handleMove);
    footer.addEventListener("mouseleave", handleLeave);

    return () => {
      footer.removeEventListener("mousemove", handleMove);
      footer.removeEventListener("mouseleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      handleLeave();
    };
  }, [reducedMotion]);

  return footerRef;
}
