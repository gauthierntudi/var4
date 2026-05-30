"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { notifyScrollInitialized } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type LegalPageContentProps = {
  updatedAt?: string;
  intro?: string;
  children: ReactNode;
};

export function LegalPageContent({ updatedAt, intro, children }: LegalPageContentProps) {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-legal-reveal='heading']", {
          y: 32,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-legal-reveal='heading']",
            start: "top 88%",
          },
        });

        ScrollTrigger.batch(".legal-page__content > section", {
          interval: 0.1,
          batchMax: 3,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 56, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.85,
                stagger: 0.08,
                ease: "power3.out",
                overwrite: true,
              },
            );
          },
          start: "top 88%",
        });

        ScrollTrigger.refresh();
      });

      notifyScrollInitialized();

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  return (
    <main ref={pageRef} className="legal-page">
      <article className="legal-page__article legal-page-container">
        {(updatedAt || intro) && (
          <p className="legal-page__updated" data-legal-reveal="heading">
            {updatedAt ? `Dernière mise à jour : ${updatedAt}` : intro}
          </p>
        )}

        <div className="legal-page__content">{children}</div>
      </article>
    </main>
  );
}
