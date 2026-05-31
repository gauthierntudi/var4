"use client";

import { Icon } from "@iconify/react/offline";
import type { SocialLinkItem } from "@/lib/social-icons";
import { SOCIAL_BRAND_ICONS } from "@/lib/social-icons";

type SocialLinksListProps = {
  links: SocialLinkItem[];
  variant: "footer" | "mobile";
  ariaSuffix?: string;
  tabIndex?: number;
  onNavigate?: () => void;
};

function getListClassName(variant: SocialLinksListProps["variant"]) {
  return variant === "footer" ? "site-footer__social-list" : "hero-header__mobile-social-list";
}

function getLinkClassName(variant: SocialLinksListProps["variant"], tone: SocialLinkItem["tone"]) {
  if (variant === "footer") {
    return `site-footer__social-link site-footer__social-link--${tone}`;
  }

  return `hero-header__mobile-social-link hero-header__mobile-social-link--${tone}`;
}

export function SocialLinksList({
  links,
  variant,
  ariaSuffix,
  tabIndex,
  onNavigate,
}: SocialLinksListProps) {
  return (
    <ul className={getListClassName(variant)}>
      {links.map((item) => (
        <li key={item.id}>
          <a
            href={item.href}
            className={getLinkClassName(variant, item.tone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaSuffix ? `${item.label} — ${ariaSuffix}` : item.label}
            tabIndex={tabIndex}
            onClick={onNavigate}
          >
            <Icon icon={SOCIAL_BRAND_ICONS[item.id]} />
          </a>
        </li>
      ))}
    </ul>
  );
}
