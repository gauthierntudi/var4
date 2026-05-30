"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { OVERLAY_SCROLL_LOCK_EVENT, resetPageScroll, SCROLL_INIT_EVENT } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProviderProps = {
  children: ReactNode;
};

function finalizeScrollSetup(lenis?: Lenis | null) {
  const html = document.documentElement;

  resetPageScroll(lenis);

  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh();

  html.classList.remove("is-preparing-scroll");
  html.classList.add("scroll-initialized");
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;

    resetPageScroll(lenisRef.current);
    ScrollTrigger.clearScrollMemory();
    ScrollTrigger.refresh();
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-preparing-scroll");
    html.classList.remove("scroll-initialized");

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isNarrowViewport = window.matchMedia("(max-width: 767px)").matches;
    const isMobileScroll = isCoarsePointer || isNarrowViewport;

    const normalizeScrollObserver = ScrollTrigger.normalizeScroll(
      isMobileScroll ? { allowNestedScroll: true } : true,
    );

    if (reducedMotion) {
      const onOverlayScrollLock = (event: Event) => {
        const locked = Boolean((event as CustomEvent<{ locked: boolean }>).detail?.locked);
        if (locked) {
          normalizeScrollObserver?.disable();
        } else {
          normalizeScrollObserver?.enable();
        }
      };

      window.addEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);
      finalizeScrollSetup();

      return () => {
        window.removeEventListener(OVERLAY_SCROLL_LOCK_EVENT, onOverlayScrollLock);
        normalizeScrollObserver?.kill();
      };
    }

    const lenis = new Lenis({
      duration: isMobileScroll ? 0.95 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: isMobileScroll,
      touchMultiplier: isMobileScroll ? 1.65 : 1.2,
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

    let finalized = false;

    const runFinalize = () => {
      if (finalized) return;
      finalized = true;
      finalizeScrollSetup(lenis);
    };

    const onPinSectionsReady = () => runFinalize();

    const fallbackTimer = window.setTimeout(runFinalize, 800);

    window.addEventListener(SCROLL_INIT_EVENT, onPinSectionsReady, { once: true });

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      finalized = false;
      html.classList.add("is-preparing-scroll");
      html.classList.remove("scroll-initialized");
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
      window.setTimeout(runFinalize, 50);
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
      window.clearTimeout(fallbackTimer);
      window.removeEventListener(SCROLL_INIT_EVENT, onPinSectionsReady);
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
};
