"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SCROLL_INIT_EVENT } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProviderProps = {
  children: ReactNode;
};

function finalizeScrollSetup(lenis?: Lenis | null) {
  const html = document.documentElement;

  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true });

  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh();

  html.classList.remove("is-preparing-scroll");
  html.classList.add("scroll-initialized");
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-preparing-scroll");
    html.classList.remove("scroll-initialized");

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    if (reducedMotion) {
      ScrollTrigger.normalizeScroll(true);
      finalizeScrollSetup();
      return;
    }

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isNarrowViewport = window.matchMedia("(max-width: 767px)").matches;
    const isMobileScroll = isCoarsePointer || isNarrowViewport;

    const lenis = new Lenis({
      duration: isMobileScroll ? 0.95 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: isMobileScroll,
      touchMultiplier: isMobileScroll ? 1.65 : 1.2,
    });

    if (isMobileScroll) {
      ScrollTrigger.normalizeScroll(true);
    }

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

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener(SCROLL_INIT_EVENT, onPinSectionsReady);
      window.removeEventListener("pageshow", onPageShow);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      html.classList.remove("scroll-initialized", "is-preparing-scroll");
    };
  }, [reducedMotion]);

  return <>{children}</>;
};
