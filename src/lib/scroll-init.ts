/** Marque la page prête après init Lenis + ScrollTrigger (sections épinglées). */
export const SCROLL_INIT_EVENT = "var:scroll-init";

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
