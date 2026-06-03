"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  isMobileScrollDevice,
  OVERLAY_SCROLL_LOCK_EVENT,
  PAGE_ANCHOR_SCROLL_OFFSET,
  resetPageScroll,
  SCROLL_INIT_EVENT,
  scrollToPageHash,
} from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProviderProps = {
  children: ReactNode;
};

function configureMobileScrollTrigger() {
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });
}

function finalizeScrollSetup(lenis?: Lenis | null) {
  const html = document.documentElement;
  const hash = window.location.hash;

  if (!hash) {
    resetPageScroll(lenis);
  }

  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh();

  html.classList.remove("is-preparing-scroll");
  html.classList.add("scroll-initialized");

  if (hash) {
    window.requestAnimationFrame(() => {
      scrollToPageHash(lenis, hash);
      ScrollTrigger.refresh();
    });
  }
}

function bindScrollInit(finalize: () => void, fallbackMs: number) {
  let finalized = false;

  const runFinalize = () => {
    if (finalized) return;
    finalized = true;
    finalize();
  };

  const fallbackTimer = window.setTimeout(runFinalize, fallbackMs);
  window.addEventListener(SCROLL_INIT_EVENT, runFinalize, { once: true });

  return () => {
    window.clearTimeout(fallbackTimer);
    window.removeEventListener(SCROLL_INIT_EVENT, runFinalize);
  };
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;

    const html = document.documentElement;
    html.classList.add("is-preparing-scroll");
    html.classList.remove("scroll-initialized");

    resetPageScroll(lenisRef.current);
    ScrollTrigger.clearScrollMemory();
    ScrollTrigger.refresh();

    return bindScrollInit(() => finalizeScrollSetup(lenisRef.current), 800);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-preparing-scroll");
    html.classList.remove("scroll-initialized");

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const isMobileScroll = isMobileScrollDevice();

    if (reducedMotion) {
      const normalizeScrollObserver = ScrollTrigger.normalizeScroll(
        isMobileScroll ? { allowNestedScroll: true } : true,
      );

      const onOverlayScrollLock = (event: Event) => {
        const locked = Boolean((event as CustomEvent<{ locked: boolean }>).detail?.locked);
        if (locked) {
          normalizeScrollObserver?.disable();
        } else {
          normalizeScrollObserver?.enable();
        }
      };

      window.addEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);

      const onHashChange = () => scrollToPageHash(null);
      window.addEventListener("hashchange", onHashChange);
      finalizeScrollSetup();

      return () => {
        window.removeEventListener("hashchange", onHashChange);
        window.removeEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);
        normalizeScrollObserver?.kill();
      };
    }

    /* Mobile : scroll natif + ScrollTrigger direct (inertie OS, pas de Lenis/syncTouch). */
    if (isMobileScroll) {
      configureMobileScrollTrigger();
      html.classList.add("scroll-native-mobile");

      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });

      const onPageShow = (event: PageTransitionEvent) => {
        if (!event.persisted) return;
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      window.addEventListener("pageshow", onPageShow);

      const unbindInit = bindScrollInit(() => finalizeScrollSetup(null), 450);

      return () => {
        unbindInit();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pageshow", onPageShow);
        html.classList.remove("scroll-native-mobile", "scroll-initialized", "is-preparing-scroll");
      };
    }

    /* Desktop : Lenis + proxy ScrollTrigger. */
    const normalizeScrollObserver = ScrollTrigger.normalizeScroll(true);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      anchors: { offset: PAGE_ANCHOR_SCROLL_OFFSET },
    });

    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => lenis.resize());

    const unbindInit = bindScrollInit(() => finalizeScrollSetup(lenis), 800);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      html.classList.add("is-preparing-scroll");
      html.classList.remove("scroll-initialized");
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
      window.setTimeout(() => finalizeScrollSetup(lenis), 50);
    };

    window.addEventListener("pageshow", onPageShow);

    const onOverlayScrollLock = (event: Event) => {
      const locked = Boolean((event as CustomEvent<{ locked: boolean }>).detail?.locked);
      if (locked) {
        normalizeScrollObserver?.disable();
      } else {
        normalizeScrollObserver?.enable();
      }
    };

    window.addEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);

    return () => {
      unbindInit();
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      normalizeScrollObserver?.kill();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      html.classList.remove("scroll-initialized", "is-preparing-scroll");
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
