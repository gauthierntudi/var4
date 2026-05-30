"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DEFAULT_HEADER_IMAGE = "/img/img08.jpg";

type LegalPageHeaderProps = {
  title: string;
  image?: string;
};

export function LegalPageHeader({ title, image = DEFAULT_HEADER_IMAGE }: LegalPageHeaderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg = bgRef.current;
      if (!section || !bg) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          bg,
          { yPercent: -18, scale: 1.12 },
          {
            yPercent: 18,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.from("[data-legal-header-reveal]", {
          y: 36,
          opacity: 0,
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.08,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="legal-page-header" aria-labelledby="legal-page-header-title">
      <div className="legal-page-header__bg" aria-hidden>
        <div ref={bgRef} className="legal-page-header__bg-inner">
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="legal-page-header__bg-image"
            priority
          />
        </div>
      </div>

      <div className="legal-page-header__overlay" aria-hidden />

      <div className="legal-page-header__inner">
        <p className="legal-page-header__eyebrow" data-legal-header-reveal>
          VAR 4 — Du Virtuel au Réel
        </p>
        <h1 id="legal-page-header-title" className="legal-page-header__title" data-legal-header-reveal>
          {title}
        </h1>
      </div>
    </section>
  );
}
