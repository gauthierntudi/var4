"use client";

import type { FocusEvent } from "react";
import {
  INSCRIPTION_COMMUNITY_TITLE_MAX,
  INSCRIPTION_COMMUNITY_TITLE_MIN,
} from "@/lib/inscription-validation";
import { INSCRIPTION_SOCIAL_NETWORKS } from "@/lib/social-profile-links";

type InscriptionSocialFieldsProps = {
  socialNetwork: string;
  communityTitle: string;
  onSocialNetworkChange: (value: string) => void;
  onCommunityTitleChange: (value: string) => void;
  onFieldFocus: (event: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function InscriptionSocialFields({
  socialNetwork,
  communityTitle,
  onSocialNetworkChange,
  onCommunityTitleChange,
  onFieldFocus,
}: InscriptionSocialFieldsProps) {
  return (
    <>
      <div className="inscription-modal__field">
        <label htmlFor="inscription-social-network">Réseau social préféré</label>
        <select
          id="inscription-social-network"
          name="socialNetwork"
          required
          value={socialNetwork}
          onChange={(event) => onSocialNetworkChange(event.target.value)}
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
        <label htmlFor="inscription-community-title">Titre dans la communauté</label>
        <input
          id="inscription-community-title"
          name="communityTitle"
          type="text"
          autoComplete="organization-title"
          enterKeyHint="next"
          required
          minLength={INSCRIPTION_COMMUNITY_TITLE_MIN}
          maxLength={INSCRIPTION_COMMUNITY_TITLE_MAX}
          value={communityTitle}
          onChange={(event) =>
            onCommunityTitleChange(
              event.target.value.slice(0, INSCRIPTION_COMMUNITY_TITLE_MAX),
            )
          }
          onFocus={onFieldFocus}
          placeholder="Créateur contenu, Ambassadeur VAR…"
        />
      </div>
    </>
  );
}
