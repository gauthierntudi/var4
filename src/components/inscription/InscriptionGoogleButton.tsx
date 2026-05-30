"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useCallback, useState } from "react";
import { GoogleIcon } from "@/components/inscription/GoogleIcon";

export type GoogleProfilePayload = {
  fullName: string;
  email: string;
  picture?: string;
};

type InscriptionGoogleButtonProps = {
  disabled?: boolean;
  onProfile: (profile: GoogleProfilePayload) => void | Promise<void>;
  onError?: (message: string) => void;
};

type GoogleUserInfo = {
  name?: string;
  email?: string;
  picture?: string;
};

export function InscriptionGoogleButton({
  disabled = false,
  onProfile,
  onError,
}: InscriptionGoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);

      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer votre profil Google.");
        }

        const profile = (await response.json()) as GoogleUserInfo;

        if (!profile.email) {
          throw new Error("Votre compte Google ne partage pas d'adresse e-mail.");
        }

        await onProfile({
          fullName: profile.name?.trim() ?? "",
          email: profile.email.trim(),
          picture: profile.picture,
        });
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "Connexion Google impossible.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      onError?.("Connexion Google annulée ou refusée.");
    },
  });

  const handleClick = useCallback(() => {
    if (disabled || isLoading) return;
    googleLogin();
  }, [disabled, googleLogin, isLoading]);

  return (
    <button
      type="button"
      className="inscription-modal__google"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      <span className="inscription-modal__google-icon" aria-hidden>
        <GoogleIcon />
      </span>
      <span className="inscription-modal__google-label">
        {isLoading ? "Connexion…" : "S'inscrire avec Google"}
      </span>
    </button>
  );
}
