 "use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const LOGO_MASK_VIDEO_URL =
  "https://res.cloudinary.com/dfqlmkknv/video/upload/v1779951438/welove_schebz.mp4";
const MASK_PHASE_MS = 15000;

export function HeroVarLogo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMaskVisible, setIsMaskVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const preloader = document.createElement("video");
    preloader.src = LOGO_MASK_VIDEO_URL;
    preloader.preload = "auto";
    preloader.muted = true;
    preloader.playsInline = true;

    const onCanPlayThrough = () => {
      if (!mounted) return;
      setIsVideoReady(true);
      setIsMaskVisible(true);
    };

    const onError = () => {
      if (!mounted) return;
      setIsVideoReady(false);
      setIsMaskVisible(false);
    };

    preloader.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
    preloader.addEventListener("error", onError, { once: true });
    preloader.load();

    return () => {
      mounted = false;
      preloader.removeEventListener("canplaythrough", onCanPlayThrough);
      preloader.removeEventListener("error", onError);
      preloader.pause();
      preloader.src = "";
    };
  }, []);

  useEffect(() => {
    if (!isVideoReady) return;

    const timer = window.setInterval(() => {
      setIsMaskVisible((current) => !current);
    }, MASK_PHASE_MS);

    return () => window.clearInterval(timer);
  }, [isVideoReady]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !isVideoReady) return;

    if (isMaskVisible) {
      void node.play().catch(() => {
        // Keep logo stable if autoplay is blocked.
      });
      return;
    }

    node.pause();
  }, [isMaskVisible, isVideoReady]);

  return (
    <div
      className={`hero-var-logo relative ${isMaskVisible ? "has-mask-active" : ""} ${className}`}
      data-hero="var-logo"
    >
      <Image
        src="/img/logo-var4.png"
        alt="VAR — Du Virtuel au Réel 4"
        width={1287}
        height={598}
        className="hero-var-logo-image h-auto w-full max-w-[min(99vw,1600px)]"
        priority
        sizes="(max-width: 640px) 99vw, (max-width: 1280px) 1200px, 1600px"
      />
      {isVideoReady ? (
        <div
          className={`hero-var-logo-mask ${isMaskVisible ? "is-visible" : ""}`}
          aria-hidden
        >
          <video
            ref={videoRef}
            className="hero-var-logo-mask__video"
            src={LOGO_MASK_VIDEO_URL}
            muted
            playsInline
            loop
            preload="auto"
          />
        </div>
      ) : null}
    </div>
  );
}
