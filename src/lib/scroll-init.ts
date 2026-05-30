/** Marque la page prête après init Lenis + ScrollTrigger (sections épinglées). */
export const SCROLL_INIT_EVENT = "var:scroll-init";

/** Décalage pour ancres (#editorial, etc.) sous le header fixe. */
export const PAGE_ANCHOR_SCROLL_OFFSET = -96;

type LenisScrollTarget = string | number | HTMLElement;

type LenisLike = {
  scrollTo: (
    target: LenisScrollTarget,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
};

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

export function scrollToPageHash(lenis?: LenisLike | null, hash = window.location.hash) {
  if (typeof window === "undefined" || !hash) return false;

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return false;

  const options = { offset: PAGE_ANCHOR_SCROLL_OFFSET };

  if (lenis) {
    lenis.scrollTo(target, options);
    return true;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
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
