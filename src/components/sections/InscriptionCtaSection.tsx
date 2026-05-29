"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

import { useInscriptionModal } from "@/components/inscription/InscriptionModalProvider";

const INSCRIPTION_EMAIL = "duvirtuelaureel@miteka.io";
const CTA_BG_IMAGE = "/img/img08.jpg";

export function InscriptionCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { openInscriptionModal } = useInscriptionModal();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg = bgRef.current;
      if (!section || !bg) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          bg,
          { yPercent: -14, scale: 1.1 },
          {
            yPercent: 14,
            scale: 1.02,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="inscription"
      className="inscription-cta"
      aria-labelledby="inscription-cta-title"
    >
      <div className="inscription-cta__bg" aria-hidden>
        <div ref={bgRef} className="inscription-cta__bg-inner">
          <Image
            src={CTA_BG_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="inscription-cta__bg-image"
            priority={false}
          />
        </div>
      </div>

      <div className="inscription-cta__overlay" aria-hidden />

      <div className="inscription-cta__inner">
        <div className="inscription-cta__copy">
          <p className="inscription-cta__eyebrow">VAR 4 · 09 août 2026 · Kinshasa</p>
          <h2 id="inscription-cta-title" className="inscription-cta__title">
            Passe de l&apos;écran au réel
          </h2>
          <p className="inscription-cta__text">
            Places limitées pour la 4<sup>e</sup> édition Du Virtuel au Réel. Inscris-toi dès
            maintenant pour ne rien manquer.
          </p>
        </div>

        <div className="inscription-cta__action">
          <button type="button" className="inscription-cta__button" onClick={openInscriptionModal}>
            <span className="inscription-cta__button-main">
              <span className="inscription-cta__button-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="inscription-cta__button-label">Inscription</span>
            </span>
            <span className="inscription-cta__button-arrow" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <p className="inscription-cta__note">
            Ou écris-nous à{" "}
            <a href={`mailto:${INSCRIPTION_EMAIL}`}>{INSCRIPTION_EMAIL}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
