"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    num: "01",
    title: "Pin & scrub",
    body: "La section reste fixée pendant que le contenu interne avance au rythme du scroll.",
  },
  {
    num: "02",
    title: "Timelines GSAP",
    body: "Enchaîne plusieurs tweens sur une timeline liée à ScrollTrigger pour un storytelling fluide.",
  },
  {
    num: "03",
    title: "Lenis + ST",
    body: "Le proxy scroller synchronise Lenis et ScrollTrigger pour des animations sans saccades.",
  },
];

export function PinnedStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const pin = pinRef.current;
        if (!track || !pin) return;

        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");

        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - pin.offsetWidth),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: pin,
            scrub: 1,
            start: "top top",
            end: () => `+=${track.scrollWidth - pin.offsetWidth}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        panels.forEach((panel) => {
          const title = panel.querySelector("[data-panel-title]");
          if (!title) return;

          gsap.from(title, {
            y: 48,
            opacity: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: "left 85%",
              end: "left 55%",
              scrub: 1,
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(trackRef.current, { clearProps: "all" });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative bg-surface"
      aria-label="Section épinglée avec défilement horizontal"
    >
      <div ref={pinRef} className="flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-12 lg:px-20">
          <p className="text-sm tracking-[0.2em] text-accent uppercase">Démo · Pin horizontal</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Une section qui reste en place pendant que tu scrolles
          </h2>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex w-max gap-6 px-6 md:gap-8 md:px-12 lg:px-20"
        >
          {STEPS.map((step) => (
            <article
              key={step.num}
              data-panel
              className="flex h-[min(52vh,420px)] w-[min(85vw,380px)] shrink-0 flex-col justify-between rounded-2xl border border-[var(--border)] bg-background/60 p-8 backdrop-blur-sm md:w-[420px]"
            >
              <span className="text-5xl font-light text-accent/40">{step.num}</span>
              <div>
                <h3
                  data-panel-title
                  className="text-2xl font-semibold tracking-tight"
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-muted leading-relaxed">{step.body}</p>
              </div>
            </article>
          ))}

          <article
            data-panel
            className="flex h-[min(52vh,420px)] w-[min(85vw,380px)] shrink-0 items-center justify-center rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-8 md:w-[420px]"
          >
            <p className="text-center text-lg text-muted">
              Ajoute tes propres panneaux ici — images, vidéos, citations…
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
