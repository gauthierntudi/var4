"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ARCHIVE_IMAGES = [
  "img01.jpg",
  "img02.jpg",
  "img03.jpg",
  "img04.jpg",
  "img05.jpg",
  "img06.jpg",
  "img07.jpg",
  "img08.jpg",
  "img09.jpg",
  "img010.jpg",
  "img011.jpg",
  "img012.jpg",
  "img013.jpg",
  "img014.jpg",
  "img015.jpg",
] as const;

export function AdutArchiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const closeModalRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditorialOpen, setIsEditorialOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const outerOrbit = ARCHIVE_IMAGES.slice(0, 9);
  const middleOrbit = ARCHIVE_IMAGES.slice(9, 13);
  const innerOrbit = ARCHIVE_IMAGES.slice(13);
  const firstOrbitCount = isMobile ? 10 : 14;
  const firstOrbitDense = Array.from(
    { length: firstOrbitCount },
    (_, index) => outerOrbit[index % outerOrbit.length],
  );
  const secondOrbitDense = Array.from(
    { length: 14 },
    (_, index) => middleOrbit[index % middleOrbit.length],
  );
  const thirdOrbitDense = Array.from({ length: 22 }, (_, index) => innerOrbit[index % innerOrbit.length]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId = 0;
    let baseScrollTarget = window.scrollY * 0.065;
    let idleRotation = 0;
    let current = baseScrollTarget;
    let lastDirection: 1 | -1 = 1;
    let lastScrollY = window.scrollY;
    const idleStep = 0.035;

    const tick = () => {
      idleRotation += lastDirection * idleStep;
      const target = baseScrollTarget + idleRotation;
      current += (target - current) * 0.09;
      section.style.setProperty("--orbit-outer-rotation", `${current}deg`);
      section.style.setProperty("--orbit-middle-rotation", `${-current * 1.1}deg`);
      section.style.setProperty("--orbit-inner-rotation", `${current * 1.28}deg`);
      rafId = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const nextY = window.scrollY;
      if (nextY > lastScrollY) lastDirection = 1;
      if (nextY < lastScrollY) lastDirection = -1;
      lastScrollY = nextY;
      baseScrollTarget = nextY * 0.065;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!isEditorialOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEditorialOpen(false);
    };

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("editorial-modal-open");
    window.addEventListener("keydown", onKeyDown);
    closeModalRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.classList.remove("editorial-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isEditorialOpen]);

  const getCardStyle = (
    index: number,
    total: number,
    radius: string,
    tiltSeed: number,
  ): CSSProperties =>
    ({
      "--orbit-angle": `${(360 / total) * index}deg`,
      "--orbit-radius": radius,
      "--orbit-tilt": `${(index % 2 === 0 ? -1 : 1) * (tiltSeed + (index % 3) * 1.2)}deg`,
      "--orbit-size": "clamp(2.45rem, 4.6vw, 3.6rem)",
    }) as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="adut-archive"
      aria-label="Archive immersive inspiree ISB 163"
    >
      <div className="adut-archive__stage">
        <div className="adut-archive__orbit adut-archive__orbit--outer" aria-hidden>
          {firstOrbitDense.map((name, index) => (
            <article
              key={`outer-${name}-${index}`}
              className="adut-archive__card"
              style={getCardStyle(index, firstOrbitDense.length, "min(22vw, 14rem)", 3.2)}
            >
              <Image
                src={`/img/${name}`}
                alt={`Archive visuel ${index + 1}`}
                width={640}
                height={920}
                className="adut-archive__image"
                sizes="(max-width: 640px) 20vw, (max-width: 1024px) 13vw, 11vw"
              />
            </article>
          ))}
        </div>

        <div className="adut-archive__orbit adut-archive__orbit--middle" aria-hidden>
          {secondOrbitDense.map((name, index) => (
            <article
              key={`middle-${name}-${index}`}
              className="adut-archive__card"
              style={getCardStyle(index, secondOrbitDense.length, "min(38vw, 24.5rem)", 3.6)}
            >
              <Image
                src={`/img/${name}`}
                alt={`Archive visuel ${index + 7}`}
                width={640}
                height={920}
                className="adut-archive__image"
                sizes="(max-width: 640px) 17vw, (max-width: 1024px) 11vw, 9vw"
              />
            </article>
          ))}
        </div>

        <div className="adut-archive__orbit adut-archive__orbit--inner" aria-hidden>
          {thirdOrbitDense.map((name, index) => (
            <article
              key={`inner-${name}-${index}`}
              className="adut-archive__card"
              style={getCardStyle(index, thirdOrbitDense.length, "min(54vw, 34rem)", 4)}
            >
              <Image
                src={`/img/${name}`}
                alt={`Archive visuel ${index + 12}`}
                width={640}
                height={920}
                className="adut-archive__image"
                sizes="(max-width: 640px) 18vw, (max-width: 1024px) 11vw, 9vw"
              />
            </article>
          ))}
        </div>

        <button
          type="button"
          className="adut-archive__center"
          onClick={() => setIsEditorialOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isEditorialOpen}
          aria-controls="editorial-modal"
        >
          <h2 className="adut-archive__title">Editorial</h2>
          <p className="adut-archive__subtitle">Mot des organisateurs</p>
        </button>
      </div>

      {isMounted && isEditorialOpen
        ? createPortal(
            <div className="adut-archive__modal" role="dialog" aria-modal="true" id="editorial-modal">
              <div className="adut-archive__modal-backdrop" onClick={() => setIsEditorialOpen(false)} />
              <div className="adut-archive__modal-panel">
                <button
                  ref={closeModalRef}
                  type="button"
                  className="adut-archive__modal-close"
                  onClick={() => setIsEditorialOpen(false)}
                  aria-label="Fermer le modal"
                >
                  ✕
                </button>

                <h3 className="adut-archive__modal-title">Editorial</h3>
                <p className="adut-archive__modal-subtitle">Mot des organisateurs</p>

                <div className="adut-archive__modal-content">
                  <p className="adut-archive__modal-paragraph" style={{ "--stagger": "0.05s" } as CSSProperties}>
                    Depuis sa creation, Du Virtuel au Reel poursuit une vision claire : transformer
                    l&apos;influence digitale en impact reel.
                  </p>
                  <p className="adut-archive__modal-paragraph" style={{ "--stagger": "0.12s" } as CSSProperties}>
                    Apres trois editions marquees par une forte mobilisation, une communaute engagee et
                    des partenariats solides, la 4e edition franchit une nouvelle etape strategique
                    autour d&apos;un theme federateur :{" "}
                    <span className="adut-archive__highlight">« Jeunesse ya Qualite »</span>.
                  </p>
                  <p className="adut-archive__modal-paragraph" style={{ "--stagger": "0.19s" } as CSSProperties}>
                    Il s&apos;agit d&apos;une invitation solennelle a toutes celles et ceux qui se
                    reconnaissent dans l&apos;action positive au profit de leur communaute, mais aussi
                    a ceux qui souhaitent evoluer, se transformer, se sensibiliser et porter la bonne
                    casquette.
                  </p>
                  <p className="adut-archive__modal-paragraph" style={{ "--stagger": "0.26s" } as CSSProperties}>
                    Ensemble, retrouvons-nous autour de{" "}
                    <span className="adut-archive__highlight">
                      divertissements, de contenus et de reseautage ya qualite.
                    </span>
                  </p>

                  <div className="adut-archive__modal-logos" style={{ "--stagger": "0.32s" } as CSSProperties}>
                    <Image
                      src="/img/tbd.png"
                      alt="Team Booster Digital"
                      width={160}
                      height={48}
                      className="adut-archive__modal-logo"
                    />
                    <span className="adut-archive__modal-logo-divider" aria-hidden />
                    <Image
                      src="/img/miteka.png"
                      alt="Miteka Advertising"
                      width={160}
                      height={48}
                      className="adut-archive__modal-logo"
                    />
                  </div>
                </div>

                <footer className="adut-archive__modal-footer">
                  <a
                    href="#contact"
                    className="adut-archive__modal-action adut-archive__modal-action--primary"
                    onClick={() => setIsEditorialOpen(false)}
                  >
                    Nous contacter
                  </a>
                  <button
                    type="button"
                    className="adut-archive__modal-action adut-archive__modal-action--ghost"
                    onClick={() => setIsEditorialOpen(false)}
                  >
                    Fermer
                  </button>
                </footer>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
