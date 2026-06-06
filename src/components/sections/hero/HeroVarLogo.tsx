"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const LOGO_MASK_VIDEO_URL =
  "https://mypullzond243.b-cdn.net/var4/0530222.mp4";
const LOGO_MASK_IMAGE = "/img/logo-var4.png";
const MASK_PHASE_MS = 15000;

function detectAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function HeroVarLogo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvasMask] = useState(() => detectAppleTouchDevice());
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMaskVisible, setIsMaskVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const preloader = document.createElement("video");
    preloader.src = LOGO_MASK_VIDEO_URL;
    preloader.preload = "auto";
    preloader.muted = true;
    preloader.playsInline = true;
    preloader.crossOrigin = "anonymous";

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

  useEffect(() => {
    if (!useCanvasMask || !isVideoReady || !isMaskVisible) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logo = new window.Image();
    logo.src = LOGO_MASK_IMAGE;
    logo.decoding = "async";

    let raf = 0;
    let logoReady = false;

    const syncCanvasSize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const renderFrame = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height || video.readyState < 2) {
        raf = window.requestAnimationFrame(renderFrame);
        return;
      }

      syncCanvasSize();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(video, 0, 0, width, height);

      if (logoReady) {
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(logo, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }

      raf = window.requestAnimationFrame(renderFrame);
    };

    const onLogoLoad = () => {
      logoReady = true;
      syncCanvasSize();
    };

    logo.addEventListener("load", onLogoLoad);
    if (logo.complete) {
      onLogoLoad();
    }

    const onResize = () => syncCanvasSize();
    window.addEventListener("resize", onResize);
    raf = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      logo.removeEventListener("load", onLogoLoad);
    };
  }, [useCanvasMask, isVideoReady, isMaskVisible]);

  const maskClassName = `hero-var-logo-mask ${isMaskVisible ? "is-visible" : ""}`;

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
        sizes="(max-width: 640px) 99vw, (max-width: 1279px) 1100px, 1600px"
      />

      {isVideoReady ? (
        useCanvasMask ? (
          <>
            <video
              ref={videoRef}
              className="hero-var-logo-mask__source"
              src={LOGO_MASK_VIDEO_URL}
              muted
              playsInline
              loop
              preload="auto"
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className={`${maskClassName} hero-var-logo-mask--canvas`}
              aria-hidden
            />
          </>
        ) : (
          <div className={maskClassName} aria-hidden>
            <video
              ref={videoRef}
              className="hero-var-logo-mask__video"
              src={LOGO_MASK_VIDEO_URL}
              muted
              playsInline
              loop
              preload="auto"
              crossOrigin="anonymous"
            />
          </div>
        )
      ) : null}
    </div>
  );
}
