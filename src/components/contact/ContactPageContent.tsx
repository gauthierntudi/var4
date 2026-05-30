"use client";

import Image from "next/image";
import { Icon } from "@iconify/react/offline";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_CARD_ICONS } from "@/lib/contact-card-icons";
import { notifyScrollInitialized } from "@/lib/scroll-init";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CONTACT_BG_IMAGE = "/img/background-contact.jpg";

const CONTACT_BLOCKS = [
  {
    id: "email",
    icon: CONTACT_CARD_ICONS.email,
    label: "E-mail",
    value: "duvirtuelaureel@miteka.io",
    href: "mailto:duvirtuelaureel@miteka.io",
  },
  {
    id: "support",
    icon: CONTACT_CARD_ICONS.support,
    label: "Support",
    value: "support@miteka.io",
    href: "mailto:support@miteka.io",
  },
  {
    id: "phone",
    icon: CONTACT_CARD_ICONS.phone,
    label: "Téléphone",
    value: "+243 906 270 321",
    href: "tel:+243906270321",
  },
  {
    id: "event",
    icon: CONTACT_CARD_ICONS.event,
    label: "Événement",
    value: "09 août 2026 · Kinshasa",
    href: null,
  },
] as const;

export function ContactPageContent() {
  const pageRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = pageRef.current;
      const bg = bgRef.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (section && bg) {
          gsap.fromTo(
            bg,
            { yPercent: -16, scale: 1.12 },
            {
              yPercent: 16,
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
        }

        gsap.from("[data-contact-reveal='hero']", {
          y: 36,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
        });

        gsap.from("[data-contact-reveal='card']", {
          y: 28,
          opacity: 0,
          duration: 0.75,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.12,
        });

        gsap.from("[data-contact-reveal='panel']", {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.18,
        });

        ScrollTrigger.refresh();
      });

      notifyScrollInitialized();

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  return (
    <main ref={pageRef} className="contact-page">
      <div className="contact-page__bg" aria-hidden>
        <div ref={bgRef} className="contact-page__bg-inner">
          <Image
            src={CONTACT_BG_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="contact-page__bg-image"
            priority
          />
        </div>
      </div>

      <div className="contact-page__overlay" aria-hidden />

      <div className="contact-page__inner">
        <div className="contact-page__layout">
          <div className="contact-page__info">
            <p className="contact-page__eyebrow" data-contact-reveal="hero">
              VAR 4 — Contact
            </p>
            <h1 className="contact-page__title" data-contact-reveal="hero">
              Contactez-nous
            </h1>
            <p className="contact-page__lead" data-contact-reveal="hero">
              Sponsoring, partenariat ou stand — réponse rapide.
            </p>

            <div className="contact-page__cards">
              {CONTACT_BLOCKS.map((block) => (
                <article
                  key={block.id}
                  className={`contact-page__card contact-page__card--${block.id}`}
                  aria-label={block.label}
                  data-contact-reveal="card"
                >
                  <div className="contact-page__card-icon" aria-hidden>
                    <Icon icon={block.icon} className="contact-page__card-icon-svg" />
                  </div>

                  <div className="contact-page__card-body">
                    <p className="contact-page__card-label">{block.label}</p>
                    {block.href ? (
                      <a href={block.href} className="contact-page__card-value">
                        {block.value}
                      </a>
                    ) : (
                      <p className="contact-page__card-value contact-page__card-value--static">
                        {block.value}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="contact-page__panel" data-contact-reveal="panel">
            <h2 className="contact-page__panel-title">Écrivez-nous un message</h2>
            <p className="contact-page__panel-lead">
              Décrivez votre demande, nous vous répondons par e-mail.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
