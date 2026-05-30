"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type InscriptionGoogleGateProps = {
  children: ReactNode;
};

/** Enveloppe le modal (portal) pour que OAuth Google fonctionne côté client. */
export function InscriptionGoogleGate({ children }: InscriptionGoogleGateProps) {
  if (!GOOGLE_CLIENT_ID) {
    return children;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}
