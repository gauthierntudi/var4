import { SocialLinksList } from "@/components/ui/SocialLinksList";
import { MOBILE_SOCIAL_LINKS, VAR4_SOCIAL_HANDLE } from "@/lib/social-icons";

const SOCIAL_DISPLAY = `@${VAR4_SOCIAL_HANDLE}`;

type HeroMobileSocialProps = {
  menuOpen: boolean;
  onNavigate?: () => void;
};

export function HeroMobileSocial({ menuOpen, onNavigate }: HeroMobileSocialProps) {
  return (
    <section className="hero-header__mobile-social" aria-label="Réseaux sociaux">
      <p className="hero-header__mobile-social-title">Suivez nous sur</p>
      <p className="hero-header__mobile-social-handle">{SOCIAL_DISPLAY}</p>

      <SocialLinksList
        links={MOBILE_SOCIAL_LINKS}
        variant="mobile"
        ariaSuffix={SOCIAL_DISPLAY}
        tabIndex={menuOpen ? 0 : -1}
        onNavigate={onNavigate}
      />
    </section>
  );
}
