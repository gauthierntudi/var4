/** Marque la page prête après init Lenis + ScrollTrigger (sections épinglées). */
export const SCROLL_INIT_EVENT = "var:scroll-init";

/** Bloque le scroll global (Lenis / normalizeScroll) pendant un overlay modal. */
export const OVERLAY_SCROLL_LOCK_EVENT = "var:overlay-scroll-lock";

export function setOverlayScrollLock(locked: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OVERLAY_SCROLL_LOCK_EVENT, { detail: { locked } }),
  );
}

/** Remet le scroll en haut (natif + Lenis) et notifie les listeners (ex. header). */
export function resetPageScroll(lenis?: { scrollTo: (target: number, options?: { immediate?: boolean }) => void } | null) {
  if (typeof window === "undefined") return;

  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true });
  window.dispatchEvent(new Event("scroll"));
}

export function notifyScrollInitialized() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SCROLL_INIT_EVENT));
}

export function onScrollInitialized(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const run = () => callback();

  if (document.documentElement.classList.contains("scroll-initialized")) {
    run();
    return () => undefined;
  }

  window.addEventListener(SCROLL_INIT_EVENT, run, { once: true });
  return () => window.removeEventListener(SCROLL_INIT_EVENT, run);
}
