"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function BackofficeLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/backoffice/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Connexion impossible.");
      }

      router.replace("/backoffice");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="backoffice-login__form" onSubmit={handleSubmit}>
      <label className="backoffice-field">
        <span className="backoffice-field__label">Mot de passe</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="backoffice-field__input"
          placeholder="Mot de passe backoffice"
        />
      </label>

      {error ? (
        <p className="backoffice-login__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="backoffice-button backoffice-button--primary" disabled={isSubmitting}>
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
