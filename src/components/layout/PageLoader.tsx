"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SCROLL_INIT_EVENT } from "@/lib/scroll-init";

const PROGRESS_RADIUS = 54;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

const LOADER_THEMES = [
  {
    base: "#193e6c",
    shade: "#122f52",
    accent: "#77deb9",
    track: "rgba(255, 255, 255, 0.16)",
    label: "rgba(255, 255, 255, 0.82)",
  },
  {
    base: "#4c98d2",
    shade: "#3a87c0",
    accent: "#d1f474",
    track: "rgba(255, 255, 255, 0.2)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#77deb9",
    shade: "#5fd4a8",
    accent: "#193e6c",
    track: "rgba(25, 62, 108, 0.14)",
    label: "rgba(25, 62, 108, 0.82)",
  },
  {
    base: "#8579ec",
    shade: "#6f65d4",
    accent: "#d1f474",
    track: "rgba(255, 255, 255, 0.18)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#ea7637",
    shade: "#d46328",
    accent: "#193e6c",
    track: "rgba(255, 255, 255, 0.2)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#d1f474",
    shade: "#b8d95a",
    accent: "#193e6c",
    track: "rgba(25, 62, 108, 0.12)",
    label: "rgba(25, 62, 108, 0.78)",
  },
] as const;

type LoaderTheme = (typeof LOADER_THEMES)[number];

function pickRandomLoaderTheme() {
  return LOADER_THEMES[Math.floor(Math.random() * LOADER_THEMES.length)]!;
}

function isPagePreparing() {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("is-preparing-scroll");
}

function getDocumentProgress() {
  const { readyState } = document;
  if (readyState === "complete") return 65;
  if (readyState === "interactive") return 35;
  return 12;
}

export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<LoaderTheme>(LOADER_THEMES[0]);

  useEffect(() => {
    setTheme(pickRandomLoaderTheme());
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;

    const syncVisibility = () => {
      setVisible(isPagePreparing());
    };

    syncVisibility();

    const observer = new MutationObserver(syncVisibility);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVisible(isPagePreparing());
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const html = document.documentElement;

    const bump = (value: number) => {
      if (!cancelled) {
        setProgress((current) => Math.max(current, value));
      }
    };

    setProgress(0);
    bump(8);
    bump(getDocumentProgress());

    const onDomReady = () => bump(35);
    const onWindowLoad = () => bump(65);
    const onScrollReady = () => bump(100);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
    }

    if (document.readyState !== "complete") {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    window.addEventListener(SCROLL_INIT_EVENT, onScrollReady, { once: true });

    if (html.classList.contains("scroll-initialized")) {
      bump(100);
    }

    const readyObserver = new MutationObserver(() => {
      if (html.classList.contains("scroll-initialized")) {
        bump(100);
      }
    });

    readyObserver.observe(html, { attributes: true, attributeFilter: ["class"] });

    const creepTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 98) return current;

        const cap = html.classList.contains("is-preparing-scroll") ? 92 : 100;
        const next = current + Math.max(0.5, (cap - current) * 0.14);

        return Math.min(next, cap);
      });
    }, 90);

    return () => {
      cancelled = true;
      window.clearInterval(creepTimer);
      document.removeEventListener("DOMContentLoaded", onDomReady);
      window.removeEventListener("load", onWindowLoad);
      window.removeEventListener(SCROLL_INIT_EVENT, onScrollReady);
      readyObserver.disconnect();
    };
  }, [pathname]);

  if (!visible) return null;

  const strokeOffset = PROGRESS_CIRCUMFERENCE * (1 - progress / 100);
  const displayProgress = Math.min(100, Math.round(progress));

  return (
    <div
      className="page-loader"
      role="status"
      aria-live="polite"
      aria-label={`Chargement de la page ${displayProgress} pourcent`}
      style={{
        background: `linear-gradient(180deg, ${theme.base} 0%, ${theme.shade} 100%)`,
        ["--loader-accent" as string]: theme.accent,
        ["--loader-track" as string]: theme.track,
        ["--loader-label" as string]: theme.label,
      }}
    >
      <div className="page-loader__panel">
        <div className="page-loader__circle" aria-hidden>
          <svg className="page-loader__progress-svg" viewBox="0 0 120 120">
            <circle
              className="page-loader__track"
              cx="60"
              cy="60"
              r={PROGRESS_RADIUS}
              fill="none"
            />
            <circle
              className="page-loader__progress"
              cx="60"
              cy="60"
              r={PROGRESS_RADIUS}
              fill="none"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
            />
          </svg>

          <div className="page-loader__logo-wrap">
            <Image
              src="/img/logo-var4.png"
              alt=""
              width={120}
              height={48}
              className="page-loader__logo"
              priority
            />
          </div>
        </div>

        <p className="page-loader__percent" aria-hidden="true">
          <span className="page-loader__percent-value">{displayProgress}</span>
          <span className="page-loader__percent-symbol">%</span>
        </p>
      </div>
    </div>
  );
}
