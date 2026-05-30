"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { CollaborateCommunityData, CollaborateCommunityPerson } from "@/lib/collaborate-community";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AUDIENCE_TAGS = [
  {
    label: "Entrepreneurs digitaux",
    bg: "#8579ec",
    top: "8%",
    left: "10%",
    drift: "1",
  },
  {
    label: "Étudiants & jeunes professionnels",
    bg: "#ea7637",
    top: "8%",
    left: "90%",
    drift: "2",
  },
  {
    label: "Jeunes de 18 à 35 ans",
    bg: "#678c05",
    top: "95%",
    left: "6%",
    drift: "3",
  },
  {
    label: "Créateurs de contenu",
    bg: "#162042",
    top: "92%",
    left: "90%",
    drift: "4",
  },
  {
    label: "Communautés en ligne influentes",
    bg: "#05c27e",
    top: "62%",
    left: "82%",
    drift: "5",
  },
] as const;

type PersonPosition = { top: string; left: string };

type CollaborateSectionProps = {
  communityData: CollaborateCommunityData;
};

function getPersonPropulsionStyle({ top, left }: PersonPosition) {
  const topValue = Number.parseFloat(top) / 100;
  const leftValue = Number.parseFloat(left) / 100;
  const deltaX = leftValue - 0.5;
  const deltaY = topValue - 0.5;
  const length = Math.hypot(deltaX, deltaY) || 1;

  return {
    top,
    left,
    ["--propel-x" as string]: `${((deltaX / length) * 1.35).toFixed(3)}rem`,
    ["--propel-y" as string]: `${((deltaY / length) * 1.35).toFixed(3)}rem`,
  };
}

function CollaboratePersonImage({
  person,
  sizes,
}: {
  person: CollaborateCommunityPerson;
  sizes: string;
}) {
  if (person.isDynamic) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.src}
        alt={person.fullName ? `Photo de ${person.fullName}` : ""}
        width={220}
        height={220}
        className="collaborate__person-image"
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={person.src}
      alt=""
      width={220}
      height={220}
      className="collaborate__person-image"
      sizes={sizes}
    />
  );
}

export function CollaborateSection({ communityData }: CollaborateSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const outerPersons = communityData.persons.filter((person) => person.ring === "outer");
  const innerPersons = communityData.persons.filter((person) => person.ring === "inner");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-collaborate='title']", {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        });

        gsap.from("[data-collaborate='ring']", {
          scale: 0.88,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-collaborate='visual']",
            start: "top 82%",
          },
        });

        gsap.from("[data-collaborate='person']", {
          scale: 0,
          opacity: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: "back.out(2)",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-collaborate='visual']",
            start: "top 80%",
          },
        });

        gsap.from("[data-collaborate='smiley']", {
          scale: 0.6,
          opacity: 0,
          duration: 0.7,
          delay: 0.15,
          ease: "back.out(2.5)",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-collaborate='visual']",
            start: "top 80%",
          },
        });

        gsap.from("[data-collaborate='tag']", {
          scale: 0.6,
          opacity: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "back.out(1.8)",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-collaborate='visual']",
            start: "top 78%",
          },
        });

        gsap.from("[data-collaborate='text']", {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-collaborate='footer']",
            start: "top 92%",
          },
        });
      });

      ScrollTrigger.refresh();

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="community"
      className="collaborate"
      aria-labelledby="collaborate-title"
      data-collaborate-mode={communityData.mode}
    >
      <div className="collaborate__inner">
        <h2 id="collaborate-title" className="collaborate__title" data-collaborate="title">
          <span>Profil de l&apos;Audience</span>
        </h2>

        <div className="collaborate__visual" data-collaborate="visual">
          <div className="collaborate__scene">
            <div className="collaborate__orbit">
              <div className="collaborate__ring collaborate__ring--outer" data-collaborate="ring" aria-hidden />
              <div className="collaborate__ring collaborate__ring--inner" data-collaborate="ring" aria-hidden />

              <div className="collaborate__smiley" data-collaborate="smiley" aria-hidden>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="32" r="4" fill="currentColor" />
                  <circle cx="52" cy="32" r="4" fill="currentColor" />
                  <path
                    d="M24 48C30 58 50 58 56 48"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {outerPersons.map((person) => (
                <div
                  key={person.key}
                  className="collaborate__person collaborate__person--outer"
                  style={getPersonPropulsionStyle(person)}
                >
                  <div className="collaborate__person-frame" data-collaborate="person">
                    <CollaboratePersonImage
                      person={person}
                      sizes="(max-width: 640px) 18vw, 88px"
                    />
                  </div>
                </div>
              ))}

              {innerPersons.map((person) => (
                <div
                  key={person.key}
                  className="collaborate__person collaborate__person--inner"
                  style={getPersonPropulsionStyle(person)}
                >
                  <div className="collaborate__person-frame" data-collaborate="person">
                    <CollaboratePersonImage
                      person={person}
                      sizes="(max-width: 640px) 14vw, 72px"
                    />
                  </div>
                </div>
              ))}
            </div>

            {AUDIENCE_TAGS.map((tag) => (
              <span
                key={tag.label}
                className={`collaborate__tag collaborate__tag--drift-${tag.drift}`}
                style={{
                  top: tag.top,
                  left: tag.left,
                }}
              >
                <span
                  className="collaborate__tag-inner"
                  data-collaborate="tag"
                  style={{ backgroundColor: tag.bg }}
                >
                  {tag.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="collaborate__footer" data-collaborate="footer">
          <p className="collaborate__text collaborate__text--left" data-collaborate="text">
            VAR 4 rassemble une génération de créateurs, d&apos;influenceurs et de passionnés
            du digital. Chaque inscription enrichit cette communauté vivante, ancrée à Kinshasa
            et ouverte sur le monde.
          </p>
          <p className="collaborate__text collaborate__text--right" data-collaborate="text">
            Du virtuel au réel : des échanges, des rencontres et des expériences qui
            transcendent l&apos;écran pour donner vie à de véritables connexions ya qualité.
          </p>
        </div>
      </div>
    </section>
  );
}
