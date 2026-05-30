"use client";

import { useCallback, useRef, type FocusEvent } from "react";
import {
  getEditableLinkValue,
  getSocialNetworkConfig,
  INSCRIPTION_SOCIAL_NETWORKS,
  isProbablyFullUrl,
  normalizeSocialProfileLink,
} from "@/lib/social-profile-links";

type InscriptionSocialFieldsProps = {
  socialNetwork: string;
  link: string;
  onSocialNetworkChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onFieldFocus: (event: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function InscriptionSocialFields({
  socialNetwork,
  link,
  onSocialNetworkChange,
  onLinkChange,
  onFieldFocus,
}: InscriptionSocialFieldsProps) {
  const linkInputRef = useRef<HTMLInputElement>(null);
  const config = getSocialNetworkConfig(socialNetwork);
  const isLinkDisabled = !socialNetwork;
  const linkMatchesPrefix =
    !link ||
    !config ||
    config.urlPrefixes.some((prefix) => link.toLowerCase().startsWith(prefix.toLowerCase()));
  const usesComposedLink = Boolean(config) && (linkMatchesPrefix || !isProbablyFullUrl(link));
  const linkDisplayValue = usesComposedLink ? getEditableLinkValue(socialNetwork, link) : link;

  const handleSocialNetworkChange = useCallback(
    (value: string) => {
      onSocialNetworkChange(value);

      window.setTimeout(() => {
        linkInputRef.current?.focus();
      }, 0);
    },
    [onSocialNetworkChange],
  );

  const handleLinkChange = useCallback(
    (raw: string) => {
      if (!usesComposedLink) {
        onLinkChange(raw);
        return;
      }

      if (!raw.trim()) {
        onLinkChange("");
        return;
      }

      if (isProbablyFullUrl(raw)) {
        onLinkChange(raw.trim());
        return;
      }

      onLinkChange(normalizeSocialProfileLink(socialNetwork, raw));
    },
    [onLinkChange, socialNetwork, usesComposedLink],
  );

  const handleLinkBlur = useCallback(() => {
    if (!link.trim()) return;

    try {
      const normalized = normalizeSocialProfileLink(socialNetwork, link);
      if (normalized !== link) {
        onLinkChange(normalized);
      }
    } catch {
      // La validation finale reste gérée à la soumission API.
    }
  }, [link, onLinkChange, socialNetwork]);

  return (
    <>
      <div className="inscription-modal__field">
        <label htmlFor="inscription-social-network">Réseau social préféré</label>
        <select
          id="inscription-social-network"
          name="socialNetwork"
          required
          value={socialNetwork}
          onChange={(event) => handleSocialNetworkChange(event.target.value)}
          onFocus={onFieldFocus}
        >
          <option value="" disabled>
            Sélectionner un réseau
          </option>
          {INSCRIPTION_SOCIAL_NETWORKS.map((network) => (
            <option key={network} value={network}>
              {network}
            </option>
          ))}
        </select>
      </div>

      <div className="inscription-modal__field">
        <label htmlFor="inscription-link">
          {usesComposedLink ? `Lien ${socialNetwork}` : "Lien du profil"}
        </label>

        {usesComposedLink ? (
          <div
            className="inscription-modal__link-field"
            data-disabled={isLinkDisabled || undefined}
          >
            <span className="inscription-modal__link-prefix" aria-hidden>
              {config?.displayPrefix}
            </span>
            <input
              ref={linkInputRef}
              id="inscription-link"
              name="link"
              type="text"
              inputMode="text"
              autoComplete="url"
              enterKeyHint="next"
              required={!isLinkDisabled}
              disabled={isLinkDisabled}
              value={linkDisplayValue}
              onChange={(event) => handleLinkChange(event.target.value)}
              onBlur={handleLinkBlur}
              onFocus={onFieldFocus}
              placeholder={config?.placeholder}
              aria-describedby="inscription-link-hint"
            />
          </div>
        ) : (
          <input
            ref={linkInputRef}
            id="inscription-link"
            name="link"
            type="url"
            inputMode="url"
            autoComplete="url"
            enterKeyHint="next"
            required={!isLinkDisabled}
            disabled={isLinkDisabled}
            value={link}
            onChange={(event) => handleLinkChange(event.target.value)}
            onBlur={handleLinkBlur}
            onFocus={onFieldFocus}
            placeholder={
              isLinkDisabled ? "Sélectionnez d’abord un réseau" : "https://votre-site.com/profil"
            }
            aria-describedby="inscription-link-hint"
          />
        )}

        <p id="inscription-link-hint" className="inscription-modal__field-hint">
          {socialNetwork
            ? `${config?.hint ?? "Collez l’URL complète de votre profil ou page."} Votre pseudo sera détecté automatiquement.`
            : "Choisissez d’abord un réseau pour adapter le champ."}
        </p>
      </div>
    </>
  );
}
