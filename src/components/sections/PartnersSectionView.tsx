"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { PartnerRecord } from "@/lib/partners";
import { notifyScrollInitialized } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type PartnersSectionViewProps = {
  partners: PartnerRecord[];
};

function chunkPartners<T>(items: T[], size = 3): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function splitPartners(partners: PartnerRecord[]) {
  const midpoint = Math.ceil(partners.length / 2);
  return {
    left: partners.slice(0, midpoint),
    right: partners.slice(midpoint),
  };
}

function PartnerHex({ partner }: { partner: PartnerRecord }) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={partner.logoUrl} alt="" className="partners__hex-logo" />
    </>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        className="partners__hex"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visiter le site de ${partner.name}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="partners__hex partners__hex--static" aria-label={partner.name}>
      {content}
    </div>
  );
}

function PartnerCluster({ partners, side }: { partners: PartnerRecord[]; side: "left" | "right" }) {
  const rows = chunkPartners(partners);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={`partners__cluster partners__cluster--${side}`} aria-hidden={partners.length === 0}>
      {rows.map((row, rowIndex) => (
        <ul
          key={`${side}-${rowIndex}`}
          className={`partners__row${rowIndex % 2 === 1 ? " partners__row--offset" : ""}`}
        >
          {row.map((partner) => (
            <li key={partner.id} className="partners__cell" data-partners-reveal="card">
              <div className="partners__hex-shell">
                <PartnerHex partner={partner} />
              </div>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function PartnersSectionView({ partners }: PartnersSectionViewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { left, right } = splitPartners(partners);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-partners-reveal='title']", {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });

        gsap.from("[data-partners-reveal='center']", {
          scale: 0.92,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        });

        gsap.from("[data-partners-reveal='card']", {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        });
      });

      notifyScrollInitialized();
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="sponsoring"
      className="partners"
      aria-labelledby="partners-title"
    >
      <svg className="partners__clip-defs" aria-hidden width={0} height={0}>
        <defs>
          <clipPath id="partners-hex-rounded" clipPathUnits="objectBoundingBox">
            <path d="M0.45,0.035 Q0.5,0 0.55,0.035 L0.88,0.26 Q0.93,0.275 0.93,0.33 L0.93,0.67 Q0.93,0.725 0.88,0.74 L0.55,0.965 Q0.5,1 0.45,0.965 L0.12,0.74 Q0.07,0.725 0.07,0.67 L0.07,0.33 Q0.07,0.275 0.12,0.26 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="partners__inner">
        <header className="partners__header" data-partners-reveal="title">
          <p className="partners__eyebrow">VAR 4</p>
          <h2 id="partners-title" className="partners__title">
            Nos partenaires
          </h2>
        </header>

        <div className="partners__stage">
          <PartnerCluster partners={left} side="left" />

          <div className="partners__center" data-partners-reveal="center">
            <div className="partners__center-shell">
              <div className="partners__center-hex">
                <span className="partners__center-logo" role="img" aria-label="VAR 4" />
              </div>
            </div>
          </div>

          <PartnerCluster partners={right} side="right" />
        </div>
      </div>
    </section>
  );
}
