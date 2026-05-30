import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BackofficeLoginForm } from "@/components/backoffice/BackofficeLoginForm";
import { isBackofficeAuthenticated, isBackofficeConfigured } from "@/lib/backoffice-auth";

export const metadata: Metadata = {
  title: "Connexion — Backoffice VAR 4",
  robots: { index: false, follow: false },
};

export default async function BackofficeLoginPage() {
  if (await isBackofficeAuthenticated()) {
    redirect("/backoffice");
  }

  return (
    <main className="backoffice-login">
      <div className="backoffice-login__card">
        <p className="backoffice-login__eyebrow">VAR 4</p>
        <h1 className="backoffice-login__title">Backoffice</h1>
        <p className="backoffice-login__lead">Accès équipe organisatrice.</p>

        {isBackofficeConfigured() ? (
          <BackofficeLoginForm />
        ) : (
          <p className="backoffice-login__error" role="alert">
            Backoffice non configuré. Ajoutez <code>BACKOFFICE_PASSWORD</code> dans votre fichier
            .env.
          </p>
        )}
      </div>
    </main>
  );
}
