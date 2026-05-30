"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CONTACT_SUBJECTS, type ContactSubjectValue } from "@/lib/contact";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  subject: ContactSubjectValue | "";
  customSubject: string;
  message: string;
  agreePrivacy: boolean;
};

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  customSubject: "",
  message: "",
  agreePrivacy: false,
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const showCustomSubject = form.subject === "autre";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.agreePrivacy) {
      setError("Veuillez accepter la politique de confidentialité.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email,
          subject: form.subject,
          customSubject: form.customSubject,
          message: form.message,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible d'envoyer le message.");
      }

      setForm(INITIAL_STATE);
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Impossible d'envoyer le message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="contact-form__success" role="status">
        <h3 className="contact-form__success-title">Message envoyé</h3>
        <p>
          Merci pour votre message. L&apos;équipe VAR 4 vous répondra à l&apos;adresse indiquée
          dans les meilleurs délais.
        </p>
        <button
          type="button"
          className="contact-form__submit"
          onClick={() => setIsSuccess(false)}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__grid contact-form__grid--names">
        <label className="contact-form__field">
          <span className="contact-form__label">Prénom</span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={(event) =>
              setForm((current) => ({ ...current, firstName: event.target.value }))
            }
            className="contact-form__input"
            placeholder="Votre prénom"
          />
        </label>

        <label className="contact-form__field">
          <span className="contact-form__label">Nom</span>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={(event) =>
              setForm((current) => ({ ...current, lastName: event.target.value }))
            }
            className="contact-form__input"
            placeholder="Votre nom"
          />
        </label>
      </div>

      <label className="contact-form__field">
        <span className="contact-form__label">Adresse e-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="contact-form__input"
          placeholder="vous@exemple.com"
        />
      </label>

      <label className="contact-form__field">
        <span className="contact-form__label">Objet</span>
        <select
          name="subject"
          required
          value={form.subject}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              subject: event.target.value as ContactSubjectValue | "",
              customSubject: event.target.value === "autre" ? current.customSubject : "",
            }))
          }
          className="contact-form__input contact-form__select"
        >
          <option value="" disabled>
            Sélectionnez un objet
          </option>
          {CONTACT_SUBJECTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {showCustomSubject ? (
        <label className="contact-form__field">
          <span className="contact-form__label">Précisez votre objet</span>
          <input
            type="text"
            name="customSubject"
            required
            value={form.customSubject}
            onChange={(event) =>
              setForm((current) => ({ ...current, customSubject: event.target.value }))
            }
            className="contact-form__input"
            placeholder="Décrivez brièvement votre demande"
          />
        </label>
      ) : null}

      <label className="contact-form__field">
        <span className="contact-form__label">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="contact-form__input contact-form__textarea"
          placeholder="Votre message..."
        />
      </label>

      <label className="contact-form__consent">
        <input
          type="checkbox"
          name="agreePrivacy"
          className="contact-form__consent-input"
          checked={form.agreePrivacy}
          onChange={(event) =>
            setForm((current) => ({ ...current, agreePrivacy: event.target.checked }))
          }
        />
        <span className="contact-form__toggle" aria-hidden>
          <span className="contact-form__toggle-knob" />
        </span>
        <span className="contact-form__consent-text">
          J&apos;accepte la{" "}
          <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
        </span>
      </label>

      {error ? (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="contact-form__submit"
        disabled={isSubmitting || !form.agreePrivacy}
      >
        {isSubmitting ? "Envoi en cours..." : "Envoyer"}
      </button>
    </form>
  );
}
