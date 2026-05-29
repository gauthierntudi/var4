"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HeroVarLogo } from "@/components/sections/hero/HeroVarLogo";
import { HeroInfoBar } from "@/components/sections/hero/HeroInfoBar";
import { HeroMobileSocial } from "@/components/sections/hero/HeroMobileSocial";
import { InscriptionOpenLink } from "@/components/inscription/InscriptionOpenLink";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOBILE_NAV_LINKS = [
  { href: "#hero", label: "VAR4" },
  { href: "#editorial", label: "EDITORIAL" },
  { href: "#sponsoring", label: "SPONSORING" },
  { href: "#contact", label: "CONTACT" },
] as const;

const MOBILE_GALLERY_IMAGES = ["/img/img01.jpg", "/img/img02.jpg", "/img/img03.jpg", "/img/img04.jpg"] as const;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [useVarLogoInHeader, setUseVarLogoInHeader] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setUseVarLogoInHeader(y >= 100);
      setIsHeaderScrolled(y >= 200);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      mobileCloseRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
    <section ref={sectionRef} className="hero" aria-label="VAR 4 — Du Virtuel au Réel">
      <header className={`hero-header ${isHeaderScrolled ? "hero-header--scrolled" : ""}`}>
        <div className="hero-header__inner">
          <nav className="hero-header__nav hero-header__nav--left" aria-label="Navigation gauche">
            <a href="#hero" className="hero-header__link">
              VAR4
            </a>
            <a href="#editorial" className="hero-header__link">
              EDITORIAL
            </a>
          </nav>

          <div
            className={`hero-partners relative z-20 ${useVarLogoInHeader ? "is-var" : ""}`}
          >
            <div
              className="hero-partners__brand hero-partners__brand--duo"
              aria-hidden={useVarLogoInHeader}
            >
              <div data-hero="partner">
                <Image
                  src="/img/tbd.png"
                  alt="Team Booster Digital"
                  width={160}
                  height={48}
                  className="h-8 w-auto object-contain sm:h-10"
                  priority
                />
              </div>
              <div className="hero-partners-divider" aria-hidden data-hero="partner" />
              <div data-hero="partner">
                <Image
                  src="/img/miteka.png"
                  alt="Miteka Advertising"
                  width={160}
                  height={48}
                  className="h-8 w-auto object-contain sm:h-10"
                  priority
                />
              </div>
            </div>

            <div
              className="hero-partners__brand hero-partners__brand--var"
              aria-hidden={!useVarLogoInHeader}
            >
              <Image
                src="/img/logo-var4.png"
                alt="VAR 4"
                width={360}
                height={167}
                className="hero-partners__var-logo"
                priority
              />
            </div>
          </div>

          <nav className="hero-header__nav hero-header__nav--right" aria-label="Navigation droite">
            <a href="#sponsoring" className="hero-header__link">
              SPONSORING
            </a>
            <a href="#contact" className="hero-header__link">
              CONTACT
            </a>
            <InscriptionOpenLink className="hero-header__button">
              <span className="hero-header__button-main">
                <span className="hero-header__button-count" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" className="hero-header__button-users-icon">
                    <path
                        d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="hero-header__button-label">INSCRIPTION</span>
              </span>
              <span className="hero-header__button-arrow" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" className="hero-header__button-arrow-icon">
                  <path
                    d="M7 17L17 7M17 7H8M17 7V16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </InscriptionOpenLink>
          </nav>

          <button
            type="button"
            className={`hero-header__menu-toggle ${mobileMenuOpen ? "is-open" : ""}`}
            aria-expanded={mobileMenuOpen}
            aria-controls="hero-mobile-menu"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="hero-header__menu-bar" />
            <span className="hero-header__menu-bar" />
            <span className="hero-header__menu-bar" />
          </button>
        </div>

        <div
          className={`hero-header__mobile-backdrop ${mobileMenuOpen ? "is-visible" : ""}`}
          aria-hidden="true"
          onClick={closeMobileMenu}
        />

        <nav
          id="hero-mobile-menu"
          className={`hero-header__mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
          aria-label="Navigation mobile"
          aria-hidden={!mobileMenuOpen}
          inert={mobileMenuOpen ? undefined : true}
        >
          <div className="hero-header__mobile-panel">
            <div className="hero-header__mobile-glow" aria-hidden />

            <header className="hero-header__mobile-head">
              <Image
                src="/img/logo-var4.png"
                alt="VAR 4"
                width={200}
                height={93}
                className="hero-header__mobile-logo"
              />
              <button
                ref={mobileCloseRef}
                type="button"
                className="hero-header__mobile-close"
                aria-label="Fermer le menu"
                onClick={closeMobileMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <span aria-hidden />
                <span aria-hidden />
              </button>
            </header>

            <h2 className="hero-header__mobile-title">Jeunesse Ya Qualité</h2>
            <p className="hero-header__mobile-description">
              Ensemble, retrouvons-nous autour de divertissements, de contenus et de reseautage ya
              qualite.
            </p>

            <ul className="hero-header__mobile-list">
              {MOBILE_NAV_LINKS.map((item) => (
                <li key={item.href} className="hero-header__mobile-item">
                  <a
                    href={item.href}
                    className="hero-header__mobile-link"
                    onClick={closeMobileMenu}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <span className="hero-header__mobile-link-label">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="hero-header__mobile-cta">
              <p className="hero-header__mobile-cta-text">
                Passe de l&apos;ecran au reel, reserve ta place.
              </p>
              <InscriptionOpenLink
                className="hero-header__mobile-button"
                onNavigate={closeMobileMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <span className="hero-header__mobile-button-main">
                  <span className="hero-header__mobile-button-count" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" className="hero-header__mobile-button-users-icon">
                      <path
                        d="M16 21V19C16 17.3431 14.6569 16 13 16H7C5.34315 16 4 17.3431 4 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 21V19C19.9989 17.6137 19.0418 16.4103 17.7 16.1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.7 6.1C16.0452 6.40557 17.0052 7.6116 17.0052 9C17.0052 10.3884 16.0452 11.5944 14.7 11.9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="hero-header__mobile-button-label">INSCRIVEZ-VOUS ICI</span>
                </span>
                <span className="hero-header__mobile-button-arrow" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" className="hero-header__mobile-button-arrow-icon">
                    <path
                      d="M7 17L17 7M17 7H8M17 7V16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </InscriptionOpenLink>
            </div>

            <div className="hero-header__mobile-gallery" aria-hidden>
              {MOBILE_GALLERY_IMAGES.map((src) => (
                <div key={src} className="hero-header__mobile-gallery-item">
                  <Image src={src} alt="" width={190} height={120} className="hero-header__mobile-gallery-image" />
                </div>
              ))}
            </div>

            <section className="hero-header__mobile-info" aria-label="Informations">
              <p className="hero-header__mobile-info-line">+243 906 270 321</p>
              <p className="hero-header__mobile-info-line">+243 970 674 494</p>
              <p className="hero-header__mobile-info-line">duvirtuelaureel@miteka.io</p>
              <p className="hero-header__mobile-info-line">
                67, Blvd du 30 Juin &amp; Av. TSF, Imm. Golf Appart.21 Kinshasa, Gombe
              </p>
            </section>

            <HeroMobileSocial menuOpen={mobileMenuOpen} onNavigate={closeMobileMenu} />

            <footer className="hero-header__mobile-foot">
              <p className="hero-header__mobile-meta">
                09 AOUT 2026 - DU VIRTUEL AU REEL 4
              </p>
            </footer>
          </div>
        </nav>
      </header>

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

          <div
            className="hero-float hero-float--like"
            data-hero="float"
            aria-hidden
          >
            <Image
              src="/img/icon-like.png"
              alt=""
              width={120}
              height={120}
              className="hero-float-image"
            />
          </div>
          <div
            className="hero-float hero-float--heart"
            data-hero="float"
            aria-hidden
          >
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
          <div
            className="hero-float hero-float--emoji-blur"
            data-hero="float"
            aria-hidden
          >
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
