"use client";

import { useCallback, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import facebookIcon from "@iconify-icons/simple-icons/facebook";

export type FacebookProfilePayload = {
  fullName: string;
  email: string;
  picture?: string;
};

type InscriptionFacebookButtonProps = {
  disabled?: boolean;
  onProfile: (profile: FacebookProfilePayload) => void | Promise<void>;
  onError?: (message: string) => void;
};

// Définir le type pour l'objet window.FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

export function InscriptionFacebookButton({
  disabled = false,
  onProfile,
  onError,
}: InscriptionFacebookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;

    // Charger le SDK Facebook s'il n'est pas déjà là
    if (window.FB) {
      setIsSdkReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      setIsSdkReady(true);
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/fr_FR/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    })(document, "script", "facebook-jssdk");
  }, []);

  const handleFacebookLogin = useCallback(async () => {
    if (!window.FB) {
      onError?.("Le SDK Facebook n'est pas encore chargé.");
      return;
    }

    setIsLoading(true);

    window.FB.login(
      (response: any) => {
        if (response.status === "connected") {
          window.FB.api(
            "/me",
            { fields: "name,email,picture.type(large)" },
            async (meResponse: any) => {
              try {
                if (!meResponse || meResponse.error) {
                  throw new Error("Impossible de récupérer votre profil Facebook.");
                }

                if (!meResponse.email) {
                  throw new Error("Votre compte Facebook ne partage pas d'adresse e-mail.");
                }

                await onProfile({
                  fullName: meResponse.name?.trim() ?? "",
                  email: meResponse.email.trim(),
                  picture: meResponse.picture?.data?.url,
                });
              } catch (error) {
                onError?.(
                  error instanceof Error ? error.message : "Erreur profil Facebook."
                );
              } finally {
                setIsLoading(false);
              }
            }
          );
        } else {
          setIsLoading(false);
          onError?.("Connexion Facebook annulée ou refusée.");
        }
      },
      { scope: "public_profile,email" }
    );
  }, [onProfile, onError]);

  if (!FACEBOOK_APP_ID) return null;

  return (
    <button
      type="button"
      className="inscription-modal__google inscription-modal__facebook"
      onClick={handleFacebookLogin}
      disabled={disabled || isLoading || !isSdkReady}
      aria-busy={isLoading}
    ><span className="inscription-modal__google-icon" aria-hidden>
        <Icon icon={facebookIcon} color="#1877F2" width="24" height="24" />
      </span>
      <span className="inscription-modal__google-label">
        {isLoading ? "Connexion…" : "S'inscrire avec Facebook"}
      </span>
    </button>
  );
}

export function isFacebookSignInEnabled() {
  return Boolean(FACEBOOK_APP_ID);
}
