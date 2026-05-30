import nodemailer from "nodemailer";
import { getContactSubjectLabel, type ContactFormPayload } from "@/lib/contact";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);

  if (!host || !user || !pass) {
    throw new Error("Configuration SMTP incomplète.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendContactEmail(payload: ContactFormPayload) {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!to || !from) {
    throw new Error("Adresses e-mail de contact non configurées.");
  }

  const subjectLabel = getContactSubjectLabel(payload.subject, payload.customSubject);
  const transport = createTransport();

  await transport.sendMail({
    from: `"VAR 4 Contact" <${from}>`,
    to,
    replyTo: payload.email,
    subject: `[VAR 4] ${subjectLabel} — ${payload.fullName}`,
    text: [
      "Nouveau message depuis le formulaire de contact VAR 4",
      "",
      `Nom : ${payload.fullName}`,
      `E-mail : ${payload.email}`,
      `Objet : ${subjectLabel}`,
      "",
      "Message :",
      payload.message,
    ].join("\n"),
    html: `
      <h2>Nouveau message — VAR 4 Contact</h2>
      <p><strong>Nom :</strong> ${escapeHtml(payload.fullName)}</p>
      <p><strong>E-mail :</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Objet :</strong> ${escapeHtml(subjectLabel)}</p>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
