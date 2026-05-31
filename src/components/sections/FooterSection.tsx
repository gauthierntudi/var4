"use client";

import Image from "next/image";
import Link from "next/link";

import { InscriptionOpenLink } from "@/components/inscription/InscriptionOpenLink";
import { SocialLinksList } from "@/components/ui/SocialLinksList";
import { useFooterMouseEffects } from "@/hooks/useFooterMouseEffects";
import { FOOTER_SOCIAL_LINKS } from "@/lib/social-icons";

const MAIN_LINKS = [
  { href: "/#hero", label: "Accueil" },
  { href: "/#adn-bilan", label: "L'ADN" },
  { href: "/#editorial", label: "Editorial" },
  { href: "/#inscription", label: "Rejoindre" },
] as const;

const FOOTER_EMAIL = "duvirtuelaureel@miteka.io";

const OTHER_LINKS = [
  { href: "/#sponsoring", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
  { href: "/#contact", label: "FAQ" },
  { href: "/#story", label: "Programme" },
] as const;

export function FooterSection() {
  const footerRef = useFooterMouseEffects<HTMLElement>();

  return (
    <footer ref={footerRef} id="contact" className="site-footer" aria-label="Pied de page">
      <div className="site-footer__spotlight" aria-hidden />
      <div className="site-footer__texture site-footer__texture--left" aria-hidden />
      <div className="site-footer__texture site-footer__texture--center" aria-hidden />
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__lead">
            <Link href="/#hero" className="site-footer__logo-link" aria-label="VAR4 — Accueil">
              <Image
                src="/img/logo-var4.png"
                alt="VAR4"
                width={240}
                height={112}
                className="site-footer__logo"
              />
            </Link>

            <SocialLinksList links={FOOTER_SOCIAL_LINKS} variant="footer" />
          </div>

          <nav className="site-footer__nav" aria-label="Navigation pied de page">
            <div className="site-footer__col">
              <p className="site-footer__col-title">Pages principales</p>
              <ul className="site-footer__col-list">
                {MAIN_LINKS.map((link) => (
                  <li key={link.href}>
                    {link.href === "/#inscription" ? (
                      <InscriptionOpenLink className="site-footer__nav-button">
                        {link.label}
                      </InscriptionOpenLink>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer__col">
              <p className="site-footer__col-title">Autres pages</p>
              <ul className="site-footer__col-list">
                {OTHER_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer__col">
              <p className="site-footer__col-title">Bureau</p>
              <ul className="site-footer__col-list">
                <li>
                  <span>67, Blvd du 30 Juin &amp; Av. TSF,</span>
                </li>
                <li>
                  <span>Imm. Golf Appart.21 Kinshasa, Gombe</span>
                </li>
                <li>
                  <a className="site-footer__contact-email" href={`mailto:${FOOTER_EMAIL}`}>
                    {FOOTER_EMAIL}
                  </a>
                </li>
                <li>
                  <a href="tel:+243906270321">+243 906 270 321</a>
                </li>
                <li>
                  <a href="tel:+243970674494">+243 970 674 494</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <nav className="site-footer__legal-nav" aria-label="Informations légales">
            <Link href="/contact">Contact</Link>
            <Link href="/politique-de-confidentialite">Confidentialité</Link>
            <Link href="/conditions-utilisation">Conditions d&apos;utilisation</Link>
          </nav>
          <p className="site-footer__legal">
            © 2026 VAR4. Tous droits réservés.
            <span className="site-footer__credit">
              — Designed By{" "}
              <Image
                src="/img/miteka.png"
                alt="Miteka Advertising"
                width={72}
                height={22}
                className="site-footer__miteka-logo"
              />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
