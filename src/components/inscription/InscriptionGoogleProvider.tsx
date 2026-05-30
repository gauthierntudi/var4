"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type InscriptionGoogleProviderProps = {
  children: ReactNode;
};

export function InscriptionGoogleProvider({ children }: InscriptionGoogleProviderProps) {
  if (!GOOGLE_CLIENT_ID) {
    return children;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}
