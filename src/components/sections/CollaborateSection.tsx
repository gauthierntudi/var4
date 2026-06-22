"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  buildStaticCommunityData,
  COLLABORATE_COMMUNITY_PHOTOS_URL,
  COLLABORATE_PHOTO_ROTATE_MS,
  pickRandomCommunityPersons,
  resolveCommunityDataFromApi,
  type CollaborateCommunityApiResponse,
  type CollaborateCommunityCandidate,
  type CollaborateCommunityData,
  type CollaborateCommunityPerson,
} from "@/lib/collaborate-community";
import { formatInscriptionDisplayName } from "@/lib/inscription-badge-name";
import { INSCRIPTION_FEED_EVENT } from "@/lib/inscription-feed";

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
        alt={person.fullName ? `Photo de ${formatInscriptionDisplayName(person.fullName)}` : ""}
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

export function CollaborateSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const outerOrbitRef = useRef<HTMLDivElement>(null);
  const innerOrbitRef = useRef<HTMLDivElement>(null);
  const candidatesRef = useRef<CollaborateCommunityCandidate[] | null>(null);
  const modeRef = useRef<CollaborateCommunityData["mode"]>("static");
  const totalInscriptionsRef = useRef(0);
  const [communityData, setCommunityData] = useState<CollaborateCommunityData>(() =>
    buildStaticCommunityData(),
  );

  const applyRandomPhotos = useCallback(() => {
    if (modeRef.current !== "dynamic" || !candidatesRef.current?.length) return;

    setCommunityData({
      mode: "dynamic",
      totalInscriptions: totalInscriptionsRef.current,
      persons: pickRandomCommunityPersons(candidatesRef.current),
    });
  }, []);

  const loadCommunityPhotos = useCallback(async () => {
    try {
      const response = await fetch(COLLABORATE_COMMUNITY_PHOTOS_URL, { cache: "no-store" });
      if (!response.ok) return;

      const payload = (await response.json()) as CollaborateCommunityApiResponse;
      totalInscriptionsRef.current = payload.totalInscriptions;

      if (payload.mode === "dynamic" && payload.candidates.length > 0) {
        candidatesRef.current = payload.candidates;
        modeRef.current = "dynamic";
        setCommunityData(resolveCommunityDataFromApi(payload));
        return;
      }

      candidatesRef.current = null;
      modeRef.current = "static";
      setCommunityData(buildStaticCommunityData(payload.totalInscriptions));
    } catch {
      candidatesRef.current = null;
      modeRef.current = "static";
      setCommunityData(buildStaticCommunityData());
    }
  }, []);

  useEffect(() => {
    void loadCommunityPhotos();
  }, [loadCommunityPhotos]);

  useEffect(() => {
    const onInscriptionCreated = () => {
      void loadCommunityPhotos();
    };

    window.addEventListener(INSCRIPTION_FEED_EVENT, onInscriptionCreated);
    return () => window.removeEventListener(INSCRIPTION_FEED_EVENT, onInscriptionCreated);
  }, [loadCommunityPhotos]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isVisible = false;
    let rotateTimer: number | undefined;

    const stopRotation = () => {
      if (rotateTimer !== undefined) {
        window.clearInterval(rotateTimer);
        rotateTimer = undefined;
      }
    };

    const rotatePhotos = () => {
      if (modeRef.current === "dynamic" && candidatesRef.current?.length) {
        applyRandomPhotos();
        return;
      }

      void loadCommunityPhotos();
    };

    const startRotation = () => {
      stopRotation();
      rotateTimer = window.setInterval(() => {
        void loadCommunityPhotos();
      }, COLLABORATE_PHOTO_ROTATE_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);

        if (nextVisible && !isVisible) {
          rotatePhotos();
          startRotation();
        }

        if (!nextVisible && isVisible) {
          stopRotation();
        }

        isVisible = nextVisible;
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => {
      stopRotation();
      observer.disconnect();
    };
  }, [applyRandomPhotos, loadCommunityPhotos]);

  const outerPersons = communityData.persons.filter((person) => person.ring === "outer");
  const innerPersons = communityData.persons.filter((person) => person.ring === "inner");
  const personKeys = communityData.persons.map((person) => person.key).join("|");

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

        const outerOrbit = outerOrbitRef.current;
        const innerOrbit = innerOrbitRef.current;

        const outerSpin = outerOrbit
          ? gsap.to(outerOrbit, {
              rotation: 360,
              duration: 88,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
              force3D: true,
            })
          : null;

        const innerSpin = innerOrbit
          ? gsap.to(innerOrbit, {
              rotation: -360,
              duration: 58,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
              force3D: true,
            })
          : null;

        gsap.utils
          .toArray<HTMLElement>("[data-collaborate-orbit='outer'] .collaborate__person-counter")
          .forEach((counter) => {
            gsap.to(counter, {
              rotation: -360,
              duration: 88,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
              force3D: true,
            });
          });

        gsap.utils
          .toArray<HTMLElement>("[data-collaborate-orbit='inner'] .collaborate__person-counter")
          .forEach((counter) => {
            gsap.to(counter, {
              rotation: 360,
              duration: 58,
              ease: "none",
              repeat: -1,
              transformOrigin: "50% 50%",
              force3D: true,
            });
          });

        gsap.utils.toArray<HTMLElement>("[data-collaborate-orbit='outer'] .collaborate__person-counter").forEach((counter, index) => {
          gsap.to(counter, {
            y: "+=7",
            duration: 2.4 + (index % 4) * 0.35,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.18,
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-collaborate-orbit='inner'] .collaborate__person-counter").forEach((counter, index) => {
          gsap.to(counter, {
            y: "-=6",
            duration: 2.1 + (index % 3) * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.22,
          });
        });

        const section = sectionRef.current;
        if (section && (outerSpin || innerSpin)) {
          ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => {
              outerSpin?.play();
              innerSpin?.play();
            },
            onEnterBack: () => {
              outerSpin?.play();
              innerSpin?.play();
            },
            onLeave: () => {
              outerSpin?.pause();
              innerSpin?.pause();
            },
            onLeaveBack: () => {
              outerSpin?.pause();
              innerSpin?.pause();
            },
          });
        }
      });

      ScrollTrigger.refresh();

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [personKeys], revertOnUpdate: true },
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

              <div
                ref={outerOrbitRef}
                className="collaborate__orbit-layer collaborate__orbit-layer--outer"
                data-collaborate-orbit="outer"
              >
                {outerPersons.map((person) => (
                  <div
                    key={person.key}
                    className="collaborate__person collaborate__person--outer"
                    style={getPersonPropulsionStyle(person)}
                  >
                    <div className="collaborate__person-counter">
                      <div className="collaborate__person-frame" data-collaborate="person">
                        <CollaboratePersonImage
                          person={person}
                          sizes="(max-width: 640px) 18vw, 88px"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                ref={innerOrbitRef}
                className="collaborate__orbit-layer collaborate__orbit-layer--inner"
                data-collaborate-orbit="inner"
              >
                {innerPersons.map((person) => (
                  <div
                    key={person.key}
                    className="collaborate__person collaborate__person--inner"
                    style={getPersonPropulsionStyle(person)}
                  >
                    <div className="collaborate__person-counter">
                      <div className="collaborate__person-frame" data-collaborate="person">
                        <CollaboratePersonImage
                          person={person}
                          sizes="(max-width: 640px) 14vw, 72px"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="collaborate__footer-block collaborate__footer-block--left" data-collaborate="text">
            <h3 className="collaborate__footer-title">
              <span className="collaborate__footer-title-prefix">Thème 2026 :</span>{" "}
              <span className="collaborate__footer-title-accent">Jeunesse ya Bonne Qualité</span>
            </h3>
          </div>

          <div className="collaborate__footer-block collaborate__footer-block--right" data-collaborate="text">
            <h3 className="collaborate__footer-subtitle">Pourquoi ce thème ?</h3>
            <p className="collaborate__footer-body">
              Conscient de la responsabilité de chacun dans la construction de notre pays, VAR 4
              veut par ce thème mettre chaque jeune devant sa :
            </p>
            <ul className="collaborate__footer-list">
              <li>Responsabilité</li>
              <li>Conscience</li>
              <li>Création de valeur</li>
              <li>Impact positif</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
