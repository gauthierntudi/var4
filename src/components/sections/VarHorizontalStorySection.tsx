"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AdnCardShape } from "@/components/sections/hero/AdnCardShape";
import { notifyScrollInitialized } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOBILE_MQ = "(max-width: 767px)";
const DESKTOP_MQ = "(min-width: 768px)";

const ADN_CARDS = [
  {
    tone: "orange",
    text: "Un événement citoyen, culturel et digital",
  },
  {
    tone: "purple",
    text: "Une plateforme de rencontres, d'échanges et de réseautage",
  },
  {
    tone: "lime",
    text: "Un pont entre créateurs, marques, leader d'opinion et jeunesse",
  },
] as const;

const BILAN_CIRCLES = [
  { tone: "orange", text: "Forte mobilisation des internautes" },
  { tone: "purple", text: "Engagement massif sur les réseaux sociaux" },
  { tone: "lime", text: "Présence de marques partenaires majeures" },
  { tone: "teal", text: "Retombées médiatiques et digitales significatives" },
] as const;

function CardArrowIcon() {
  return (
    <svg
      className="var-h-story__card-cta-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VarHorizontalStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const adnPanelRef = useRef<HTMLDivElement>(null);
  const bilanPanelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${DESKTOP_MQ} and (prefers-reduced-motion: no-preference)`, () => {
        const track = trackRef.current;
        const pin = pinRef.current;
        const adnPanel = adnPanelRef.current;
        const bilanPanel = bilanPanelRef.current;
        const section = sectionRef.current;
        if (!track || !pin || !section) return;

        section.classList.remove("var-h-story--mobile");

        gsap.set([pin, track], { clearProps: "all" });

        const getScrollDistance = () => Math.max(0, track.scrollWidth - pin.offsetWidth);

        const scrollTween = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: pin,
            scrub: 1,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        const parallax = (
          targets: gsap.TweenTarget,
          vars: gsap.TweenVars,
          panel: HTMLElement | null,
          start = "left 88%",
          end = "right 12%",
        ) => {
          if (!panel) return;

          gsap.to(targets, {
            ...vars,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start,
              end,
              scrub: true,
            },
          });
        };

        parallax(
          "[data-adn-heading]",
          { xPercent: -14, y: -18 },
          adnPanel,
          "left right",
          "right left",
        );

        gsap.utils.toArray<HTMLElement>("[data-adn-card]").forEach((card, index) => {
          parallax(
            card,
            {
              y: index % 2 === 0 ? -52 - index * 8 : 44 + index * 10,
              x: index * 18,
              rotation: index % 2 === 0 ? -2.5 : 2.5,
            },
            adnPanel,
            "left 92%",
            "right 8%",
          );
        });

        parallax(
          "[data-bilan-heading]",
          { xPercent: -10, y: -28 },
          bilanPanel,
          "left right",
          "right left",
        );

        parallax("[data-bilan-kicker]", { xPercent: 8, y: 12 }, bilanPanel);

        gsap.utils.toArray<HTMLElement>("[data-bilan-circle]").forEach((circle, index) => {
          parallax(
            circle,
            {
              y: index % 2 === 0 ? -36 - index * 6 : 28 + index * 5,
              x: index % 2 === 0 ? -24 - index * 10 : 20 + index * 12,
              scale: 1 + index * 0.02,
            },
            bilanPanel,
            "left 90%",
            "right 10%",
          );
        });

        parallax(
          "[data-bilan-note]",
          { y: -16, opacity: 1 },
          bilanPanel,
          "left 80%",
          "right 20%",
        );

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        section.classList.add("is-gsap-ready");
        notifyScrollInitialized();

        return () => {
          window.removeEventListener("resize", onResize);
          section.classList.remove("is-gsap-ready");
        };
      });

      mm.add(`${MOBILE_MQ} and (prefers-reduced-motion: no-preference)`, () => {
        const section = sectionRef.current;
        const track = trackRef.current;
        const pin = pinRef.current;
        if (!section || !track || !pin) return;

        section.classList.add("var-h-story--mobile");

        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === section || trigger.pin === pin) {
            trigger.kill(true);
          }
        });

        gsap.set([pin, track, section.querySelectorAll(".var-h-story__panel-content")], {
          clearProps: "all",
          opacity: 1,
          y: 0,
          x: 0,
        });

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);

        section.classList.add("is-gsap-ready");
        notifyScrollInitialized();

        return () => {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("orientationchange", onResize);
          section.classList.remove("var-h-story--mobile", "is-gsap-ready");
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([trackRef.current, pinRef.current], { clearProps: "all" });
        sectionRef.current?.classList.add("is-gsap-ready", "var-h-story--mobile");
        notifyScrollInitialized();
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="adn-bilan"
      className="var-h-story"
      data-scroll-pin
      aria-label="L'ADN et le bilan des éditions précédentes"
    >
      <div ref={pinRef} className="var-h-story__pin" data-scroll-pin-inner>
        <div ref={trackRef} className="var-h-story__track">
          <div
            ref={adnPanelRef}
            className="var-h-story__panel var-h-story__panel--adn"
            data-panel="adn"
          >
            <div className="var-h-story__panel-content">
              <h2 className="var-h-story__heading" data-adn-heading data-parallax>
                L&apos;ADN de Du Virtuel au Réel
              </h2>

              <div className="var-h-story__adn-cards">
                {ADN_CARDS.map((card) => (
                  <article
                    key={card.text}
                    data-adn-card
                    data-parallax
                    className={`var-h-story__card var-h-story__card--${card.tone}`}
                  >
                    <AdnCardShape className="var-h-story__card-shape" />
                    <p className="var-h-story__card-text">{card.text}</p>
                    <button type="button" className="var-h-story__card-cta" aria-label="En savoir plus">
                      <CardArrowIcon />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div
            ref={bilanPanelRef}
            className="var-h-story__panel var-h-story__panel--bilan"
            data-panel="bilan"
          >
            <div className="var-h-story__panel-content">
              <div className="var-h-story__bilan-intro">
                <h2 className="var-h-story__heading" data-bilan-heading data-parallax>
                  Bilan des éditions précédentes
                </h2>
                <p className="var-h-story__bilan-kicker" data-bilan-kicker data-parallax>
                  VAR 1 – VAR 2 – VAR 3
                </p>
              </div>

              <div className="var-h-story__circles">
                {BILAN_CIRCLES.map((item) => (
                  <div
                    key={item.text}
                    data-bilan-circle
                    data-parallax
                    className={`var-h-story__circle var-h-story__circle--${item.tone}`}
                  >
                    <p className="var-h-story__circle-text">{item.text}</p>
                  </div>
                ))}
              </div>

              <p className="var-h-story__bilan-note" data-bilan-note data-parallax>
                Sans l&apos;accompagnement de nos <strong>partenaires</strong>, ces résultats
                n&apos;auraient pas été possibles…
              </p>
            </div>
          </div>
        </div>

        <p className="var-h-story__credit">
          Team Booster Digital | Miteka Advertising © Janvier 2026
        </p>
      </div>
    </section>
  );
}
