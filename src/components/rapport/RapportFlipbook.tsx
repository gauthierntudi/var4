"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import type { PageFlip, PageFlipOrientation } from "page-flip";
import { notifyScrollInitialized } from "@/lib/scroll-init";

/** Largeur (px) des pages rendues depuis le PDF — assez nette en plein écran / retina. */
const RENDER_WIDTH = 1400;
const BASE_PAGE_WIDTH = 550;
/** Copies de pdfjs-dist/build (même version que package.json). */
const PDFJS_URL = "/pdfjs/pdf.min.mjs";
const PDFJS_WORKER_URL = "/pdfjs/pdf.worker.min.mjs";

/** Nombre de pages traitées avant d'afficher le livre (évite de montrer une page vide retirée ensuite). */
const PAGES_BEFORE_REVEAL = 3;

type Status = "loading" | "ready" | "error";

/** Page d'une seule couleur (ex. 2e de couverture vide) : on la retire du livre. */
function isBlankCanvas(source: HTMLCanvasElement) {
  const size = 24;
  const sample = document.createElement("canvas");
  sample.width = size;
  sample.height = size;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(source, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const [r0, g0, b0] = [data[0], data[1], data[2]];
  for (let i = 4; i < data.length; i += 4) {
    if (
      Math.abs(data[i] - r0) > 10 ||
      Math.abs(data[i + 1] - g0) > 10 ||
      Math.abs(data[i + 2] - b0) > 10
    ) {
      return false;
    }
  }
  return true;
}

type RapportFlipbookProps = {
  src: string;
  downloadName: string;
};

export function RapportFlipbook({ src, downloadName }: RapportFlipbookProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [pageCount, setPageCount] = useState(0);
  const [sourcePageCount, setSourcePageCount] = useState(0);
  const [renderedCount, setRenderedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [orientation, setOrientation] = useState<PageFlipOrientation>("landscape");
  const [pageRatio, setPageRatio] = useState(1.414);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** Miniatures (URL de l'image rendue) alignées sur les pages du livre. */
  const [thumbs, setThumbs] = useState<(string | null)[]>([]);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notifyScrollInitialized();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    const objectUrls: string[] = [];
    // PageFlip déplace / supprime ses nœuds : on lui donne un hôte hors du contrôle de React.
    const host = document.createElement("div");
    host.className = "rapport-flipbook__book";
    mount.appendChild(host);

    let pdfDoc: { destroy: () => Promise<void> } | null = null;

    (async () => {
      try {
        // pdf.js est servi depuis /public : son bundle ESM casse sous webpack (Next 15).
        const pdfjs = (await import(
          /* webpackIgnore: true */ PDFJS_URL
        )) as typeof import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

        const doc = await pdfjs.getDocument(src).promise;
        pdfDoc = doc;
        if (cancelled) return;

        const firstPage = await doc.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const ratio = baseViewport.height / baseViewport.width;
        if (cancelled) return;

        setPageRatio(ratio);
        setPageCount(doc.numPages);
        setSourcePageCount(doc.numPages);

        // Pages vides créées tout de suite : le livre est utilisable pendant le rendu.
        const images: HTMLImageElement[] = [];
        const pageEls: HTMLElement[] = [];
        for (let i = 0; i < doc.numPages; i += 1) {
          const page = document.createElement("div");
          page.className = "rapport-flipbook__page";
          page.dataset.density = "soft";
          const img = document.createElement("img");
          img.alt = `Page ${i + 1}`;
          img.draggable = false;
          img.className = "rapport-flipbook__page-img";
          page.appendChild(img);
          images.push(img);
          pageEls.push(page);
          host.appendChild(page);
        }

        const { PageFlip } = await import("page-flip");
        if (cancelled) return;

        const flip = new PageFlip(host, {
          width: BASE_PAGE_WIDTH,
          height: Math.round(BASE_PAGE_WIDTH * ratio),
          size: "stretch",
          minWidth: 240,
          maxWidth: 1200,
          minHeight: Math.round(240 * ratio),
          maxHeight: Math.round(1200 * ratio),
          // Pas de couverture isolée : le livre s'ouvre directement sur une double page (1–2).
          showCover: false,
          usePortrait: true,
          mobileScrollSupport: true,
          maxShadowOpacity: 0.45,
          flippingTime: 850,
          showPageCorners: true,
        });
        flip.loadFromHTML(pageEls);
        flip.on("flip", (e) => setCurrentPage(e.data));
        flip.on("changeOrientation", (e) => setOrientation(e.data));
        flipRef.current = flip;
        setOrientation(flip.getOrientation());

        let bookEls = [...pageEls];
        const urlByEl = new Map<HTMLElement, string>();
        const syncThumbs = () => setThumbs(bookEls.map((el) => urlByEl.get(el) ?? null));
        syncThumbs();
        const revealAfter = Math.min(PAGES_BEFORE_REVEAL, doc.numPages);

        for (let i = 1; i <= doc.numPages; i += 1) {
          if (cancelled) return;
          const page = i === 1 ? firstPage : await doc.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_WIDTH / page.getViewport({ scale: 1 }).width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.9),
          );
          const blank = bookEls.length > 1 && isBlankCanvas(canvas);
          page.cleanup();
          if (cancelled) return;

          if (blank) {
            const el = pageEls[i - 1];
            bookEls = bookEls.filter((item) => item !== el);
            el.remove();
            flip.updateFromHtml(bookEls);
            setPageCount(bookEls.length);
            syncThumbs();
          } else if (blob) {
            const url = URL.createObjectURL(blob);
            objectUrls.push(url);
            images[i - 1].src = url;
            urlByEl.set(pageEls[i - 1], url);
            syncThumbs();
          }

          setRenderedCount(i);
          if (i === revealAfter) setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[rapport] Impossible de charger le PDF", error);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      flipRef.current?.destroy();
      flipRef.current = null;
      host.remove();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      void pdfDoc?.destroy();
    };
  }, [src]);

  const flipPrev = useCallback(() => flipRef.current?.flipPrev(), []);
  const flipNext = useCallback(() => flipRef.current?.flipNext(), []);

  const goToPage = useCallback((index: number) => {
    const flip = flipRef.current;
    if (!flip) return;
    const target = Math.max(0, Math.min(index, flip.getPageCount() - 1));
    if (target === flip.getCurrentPageIndex()) return;
    flip.flip(target);
  }, []);

  const submitPageInput = (event?: FormEvent) => {
    event?.preventDefault();
    const value = Number.parseInt(pageInput, 10);
    if (Number.isFinite(value)) goToPage(value - 1);
    setIsEditingPage(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  useEffect(() => {
    if (!isFullscreen) return;
    requestAnimationFrame(() => flipRef.current?.update());
  }, [thumbsOpen, isFullscreen]);

  useEffect(() => {
    if (!thumbsOpen) return;
    const active = thumbsRef.current?.querySelector<HTMLElement>(".is-active");
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [thumbsOpen, currentPage]);

  useEffect(() => {
    if (status !== "ready") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowLeft") flipPrev();
      if (event.key === "ArrowRight") flipNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, flipPrev, flipNext]);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
      // Laisse le navigateur appliquer la nouvelle taille avant de recalculer le livre.
      requestAnimationFrame(() => flipRef.current?.update());
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const root = rootRef.current;
    if (!root) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void root.requestFullscreen?.().catch(() => undefined);
    }
  };

  const isLandscape = orientation === "landscape";
  const isFirst = currentPage === 0;
  const isLast = pageCount > 0 && currentPage >= pageCount - (isLandscape ? 2 : 1);

  let pageLabel = "";
  if (pageCount > 0) {
    const first = currentPage + 1;
    const showPair = isLandscape && currentPage < pageCount - 1;
    pageLabel = showPair ? `${first}–${first + 1}` : `${first}`;
  }

  const style = { "--rapport-page-ratio": pageRatio } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`rapport-flipbook ${isFullscreen ? "is-fullscreen" : ""} ${thumbsOpen ? "has-thumbs" : ""} is-${status}`}
      style={style}
    >
      <div className="rapport-flipbook__stage" data-lenis-prevent>
        <div ref={mountRef} className="rapport-flipbook__mount" />

        {status === "loading" && (
          <div className="rapport-flipbook__state" role="status">
            <span className="rapport-flipbook__spinner" aria-hidden />
            <p>Chargement du rapport…</p>
          </div>
        )}

        {status === "error" && (
          <div className="rapport-flipbook__state" role="alert">
            <p>Le rapport n&apos;a pas pu être affiché.</p>
            <a className="rapport-flipbook__btn rapport-flipbook__btn--accent" href={src} download={downloadName}>
              Télécharger le PDF
            </a>
          </div>
        )}
      </div>

      {status === "ready" && (
        <div className="rapport-flipbook__toolbar" aria-label="Navigation du rapport">
          <button
            type="button"
            className="rapport-flipbook__btn rapport-flipbook__btn--icon"
            onClick={flipPrev}
            disabled={isFirst}
            aria-label="Page précédente"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <form className="rapport-flipbook__counter" onSubmit={submitPageInput}>
            <input
              className="rapport-flipbook__page-input"
              type="text"
              inputMode="numeric"
              enterKeyHint="go"
              aria-label={`Aller à la page (1 à ${pageCount})`}
              value={isEditingPage ? pageInput : pageLabel}
              onFocus={(event) => {
                setPageInput(String(currentPage + 1));
                setIsEditingPage(true);
                requestAnimationFrame(() => event.target.select());
              }}
              onChange={(event) => setPageInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
              onBlur={() => setIsEditingPage(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsEditingPage(false);
                  event.currentTarget.blur();
                }
              }}
            />
            <span className="rapport-flipbook__counter-sep">/</span>
            <span>{pageCount}</span>
          </form>

          <button
            type="button"
            className="rapport-flipbook__btn rapport-flipbook__btn--icon"
            onClick={flipNext}
            disabled={isLast}
            aria-label="Page suivante"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="rapport-flipbook__divider" aria-hidden />

          <button
            type="button"
            className={`rapport-flipbook__btn rapport-flipbook__btn--icon ${thumbsOpen ? "is-active" : ""}`}
            onClick={() => setThumbsOpen((open) => !open)}
            aria-expanded={thumbsOpen}
            aria-controls="rapport-thumbs"
            aria-label={thumbsOpen ? "Masquer les pages" : "Afficher toutes les pages"}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" />
              <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" />
              <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" />
              <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <button
            type="button"
            className="rapport-flipbook__btn rapport-flipbook__btn--icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 4V9H4M15 4V9H20M9 20V15H4M15 20V15H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 9V4H9M20 9V4H15M4 15V20H9M20 15V20H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <a
            className="rapport-flipbook__btn rapport-flipbook__btn--accent"
            href={src}
            download={downloadName}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 4V15M12 15L7.5 10.5M12 15L16.5 10.5M5 19H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>PDF</span>
          </a>
        </div>
      )}

      {status === "ready" && thumbsOpen && (
        <div
          id="rapport-thumbs"
          ref={thumbsRef}
          className="rapport-flipbook__thumbs"
          role="list"
          aria-label="Pages du rapport"
          data-lenis-prevent
        >
          {thumbs.map((url, index) => {
            const isActive =
              index === currentPage || (isLandscape && index === currentPage + 1);
            return (
              <div key={index} role="listitem">
                <button
                  type="button"
                  className={`rapport-flipbook__thumb ${isActive ? "is-active" : ""}`}
                  onClick={() => goToPage(index)}
                  aria-label={`Aller à la page ${index + 1}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="rapport-flipbook__thumb-frame">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob: URL locale
                      <img src={url} alt="" draggable={false} />
                    ) : (
                      <span className="rapport-flipbook__thumb-placeholder" aria-hidden />
                    )}
                  </span>
                  <span className="rapport-flipbook__thumb-num">{index + 1}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {status === "ready" && renderedCount < sourcePageCount && (
        <p className="rapport-flipbook__progress">
          Préparation des pages… {renderedCount}/{sourcePageCount}
        </p>
      )}
    </div>
  );
}
