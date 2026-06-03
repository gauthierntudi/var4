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

type FacebookLoginStatus = "connected" | "not_authorized" | "unknown";

type FacebookLoginResponse = {
  status: FacebookLoginStatus;
  authResponse?: {
    accessToken: string;
    userID: string;
  };
};

type FacebookMeResponse = {
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  error?: {
    message?: string;
  };
};

type FacebookSDK = {
  init: (params: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope: string },
  ) => void;
  api: (
    path: string,
    params: { fields: string },
    callback: (response: FacebookMeResponse) => void,
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

function loadFacebookSdk() {
  const scriptId = "facebook-jssdk";
  if (document.getElementById(scriptId)) return;

  const firstScript = document.getElementsByTagName("script")[0];
  const js = document.createElement("script");
  js.id = scriptId;
  js.src = "https://connect.facebook.net/fr_FR/sdk.js";
  firstScript?.parentNode?.insertBefore(js, firstScript);
}

export function InscriptionFacebookButton({
  disabled = false,
  onProfile,
  onError,
}: InscriptionFacebookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;

    if (window.FB) {
      setIsSdkReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      setIsSdkReady(true);
    };

    loadFacebookSdk();
  }, []);

  const handleFacebookLogin = useCallback(async () => {
    const fb = window.FB;
    if (!fb) {
      onError?.("Le SDK Facebook n'est pas encore chargé.");
      return;
    }

    setIsLoading(true);

    fb.login(
      (response) => {
        if (response.status === "connected") {
          fb.api(
            "/me",
            { fields: "name,email,picture.type(large)" },
            async (meResponse) => {
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
                  error instanceof Error ? error.message : "Erreur profil Facebook.",
                );
              } finally {
                setIsLoading(false);
              }
            },
          );
        } else {
          setIsLoading(false);
          onError?.("Connexion Facebook annulée ou refusée.");
        }
      },
      { scope: "public_profile,email" },
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
    >
      <span className="inscription-modal__google-icon" aria-hidden>
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
