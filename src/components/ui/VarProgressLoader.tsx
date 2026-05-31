"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  pickRandomVarLoaderTheme,
  VAR_LOADER_PROGRESS_CIRCUMFERENCE,
  VAR_LOADER_PROGRESS_RADIUS,
  type VarLoaderTheme,
} from "@/lib/var-loader-theme";

type VarProgressLoaderProps = {
  active: boolean;
  ariaLabel?: string;
  className?: string;
  finishing?: boolean;
};

export function VarProgressLoader({
  active,
  ariaLabel = "Traitement en cours",
  className = "page-loader",
  finishing = false,
}: VarProgressLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<VarLoaderTheme>(() => pickRandomVarLoaderTheme());

  useEffect(() => {
    if (active) {
      setTheme(pickRandomVarLoaderTheme());
      setProgress(8);
    } else {
      setProgress(0);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    if (finishing) {
      setProgress(100);
      return;
    }

    const creepTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + Math.max(0.6, (92 - current) * 0.12), 92);
      });
    }, 90);

    return () => window.clearInterval(creepTimer);
  }, [active, finishing]);

  if (!active) return null;

  const strokeOffset = VAR_LOADER_PROGRESS_CIRCUMFERENCE * (1 - progress / 100);
  const displayProgress = Math.min(100, Math.round(progress));

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label={`${ariaLabel} ${displayProgress} pourcent`}
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
              r={VAR_LOADER_PROGRESS_RADIUS}
              fill="none"
            />
            <circle
              className="page-loader__progress"
              cx="60"
              cy="60"
              r={VAR_LOADER_PROGRESS_RADIUS}
              fill="none"
              strokeDasharray={VAR_LOADER_PROGRESS_CIRCUMFERENCE}
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
