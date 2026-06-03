"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroVarLogo } from "@/components/sections/hero/HeroVarLogo";
import { HeroInfoBar } from "@/components/sections/hero/HeroInfoBar";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-hero='partner']", {
          y: -24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
        })
          .from("[data-hero='phone']", { y: 80, opacity: 0, duration: 1 }, "-=0.3")
          .from("[data-hero='var-logo']", { scale: 0.85, opacity: 0, duration: 0.9 }, "-=0.6")
          .from(
            "[data-hero='float']",
            { scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(2)" },
            "-=0.5",
          )
          .from("[data-hero='info-bar']", { y: 40, opacity: 0, duration: 0.8 }, "-=0.2");

        gsap.to("[data-hero='float']", {
          y: "+=12",
          duration: 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.35, from: "random" },
        });

        gsap.to("[data-hero='float']", {
          y: (i) => (i % 2 === 0 ? -40 : -60),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-hero='partner']", {
          y: -24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
        })
          .from(
            "[data-hero='phone']",
            { y: 80, opacity: 0, duration: 1 },
            "-=0.3",
          )
          .from(
            "[data-hero='var-logo']",
            { scale: 0.85, opacity: 0, duration: 0.9 },
            "-=0.6",
          )
          .from(
            "[data-hero='float']",
            { scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(2)" },
            "-=0.5",
          )
          .from(
            "[data-hero='info-bar']",
            { y: 40, opacity: 0, duration: 0.8 },
            "-=0.2",
          );

        gsap.to("[data-hero='float']", {
          y: "+=12",
          duration: 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.35, from: "random" },
        });

        gsap.to("[data-hero='float']", {
          y: (i) => (i % 2 === 0 ? -40 : -60),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="hero" className="hero" aria-label="VAR 4 — Du Virtuel au Réel">
      <SiteHeader />

      <div className="hero-content" data-hero="content">
        <div className="hero-bg" aria-hidden>
          <div className="hero-bg-rays" />
        </div>

        <div className="hero-stage">
          <div className="hero-phone" data-hero="phone" aria-hidden>
            <Image
              src="/img/frame-smartphone.png"
              alt=""
              width={1784}
              height={610}
              className="hero-phone-img"
              priority
              sizes="(max-width: 640px) 98vw, (max-width: 1280px) 980px, 1320px"
            />
          </div>

          <div className="hero-float hero-float--like" data-hero="float" aria-hidden>
            <Image
              src="/img/icon-like.png"
              alt=""
              width={120}
              height={120}
              className="hero-float-image"
            />
          </div>
          <div className="hero-float hero-float--heart" data-hero="float" aria-hidden>
            <Image
              src="/img/icon-heart.png"
              alt=""
              width={120}
              height={120}
              className="hero-float-image"
            />
          </div>
          <div className="hero-float hero-float--emoji" data-hero="float" aria-hidden>
            <Image
              src="/img/icon-lol.png"
              alt=""
              width={120}
              height={120}
              className="hero-float-image"
            />
          </div>
          <div className="hero-float hero-float--emoji-blur" data-hero="float" aria-hidden>
            <Image
              src="/img/icon-lol.png"
              alt=""
              width={120}
              height={120}
              className="hero-float-image"
            />
          </div>

          <div className="hero-logo-wrap">
            <HeroVarLogo />
          </div>
        </div>

        <div className="hero-bottom">
          <HeroInfoBar />
        </div>
      </div>
    </section>
  );
}
