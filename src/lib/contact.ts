export const CONTACT_SUBJECTS = [
  { value: "sponsoring", label: "Sponsoring" },
  { value: "partenariat", label: "Partenariat" },
  { value: "infos-stand", label: "Infos Stand" },
  { value: "collaboration", label: "Collaboration" },
  { value: "autre", label: "Autre" },
] as const;

export type ContactSubjectValue = (typeof CONTACT_SUBJECTS)[number]["value"];

export type ContactFormPayload = {
  fullName: string;
  email: string;
  subject: ContactSubjectValue;
  customSubject?: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getContactSubjectLabel(value: ContactSubjectValue, customSubject?: string) {
  if (value === "autre") {
    return customSubject?.trim() || "Autre";
  }

  return CONTACT_SUBJECTS.find((item) => item.value === value)?.label ?? value;
}

export function parseContactPayload(body: unknown): ContactFormPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Données invalides.");
  }

  const data = body as Record<string, unknown>;
  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const customSubject =
    typeof data.customSubject === "string" ? data.customSubject.trim() : undefined;
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (fullName.length < 2) {
    throw new Error("Indiquez votre nom complet.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Adresse e-mail invalide.");
  }

  if (!CONTACT_SUBJECTS.some((item) => item.value === subject)) {
    throw new Error("Choisissez un objet de contact.");
  }

  if (subject === "autre" && (!customSubject || customSubject.length < 3)) {
    throw new Error("Précisez votre objet personnalisé.");
  }

  if (message.length < 10) {
    throw new Error("Votre message doit contenir au moins 10 caractères.");
  }

  if (message.length > 5000) {
    throw new Error("Votre message est trop long (5000 caractères max.).");
  }

  return {
    fullName,
    email,
    subject: subject as ContactSubjectValue,
    customSubject,
    message,
  };
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.CONTACT_TO_EMAIL,
  );
}
