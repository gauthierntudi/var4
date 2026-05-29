"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS = [
  {
    tag: "Reveal",
    title: "Entrées au scroll",
    text: "ScrollTrigger.batch() déclenche des animations groupées quand les éléments entrent dans le viewport.",
  },
  {
    tag: "Stagger",
    title: "Effet cascade",
    text: "Un léger décalage entre chaque carte crée un rythme visuel premium sans surcharge.",
  },
  {
    tag: "Perf",
    title: "Transforms only",
    text: "On anime opacity, y et scale — pas de width/height — pour garder 60 fps.",
  },
  {
    tag: "A11y",
    title: "Reduced motion",
    text: "Si l'utilisateur préfère moins d'animation, Lenis et les tweens lourds sont désactivés.",
  },
];

export function RevealSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.batch("[data-reveal-card]", {
          interval: 0.12,
          batchMax: 4,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 72, opacity: 0, scale: 0.96 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
                overwrite: true,
              },
            );
          },
          start: "top 88%",
        });

        gsap.from("[data-reveal-heading]", {
          y: 48,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-reveal-heading]",
            start: "top 85%",
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="px-6 py-32 md:px-12 lg:px-20 lg:py-40"
      aria-label="Section reveal au scroll"
    >
      <div data-reveal-heading className="max-w-2xl">
        <p className="text-sm tracking-[0.2em] text-accent uppercase">Démo · Reveal</p>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          Cartes qui apparaissent en cascade
        </h2>
        <p className="mt-6 text-lg text-muted leading-relaxed">
          Idéal pour grilles de features, témoignages ou portfolio. Remplace le contenu
          et ajuste les sélecteurs dans{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-accent">
            RevealSection.tsx
          </code>
          .
        </p>
      </div>

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title}>
            <article
              data-reveal-card
              className="group h-full rounded-2xl border border-[var(--border)] bg-surface/80 p-6 transition-colors hover:border-accent/30"
            >
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {item.tag}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">{item.text}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
