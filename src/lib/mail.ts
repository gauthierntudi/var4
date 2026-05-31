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
    text: buildContactEmailText(payload, subjectLabel),
    html: buildContactEmailHtml(payload, subjectLabel),
  });
}

function buildContactEmailText(payload: ContactFormPayload, subjectLabel: string) {
  return [
    "Nouveau message depuis le formulaire de contact VAR 4",
    "",
    `Nom : ${payload.fullName}`,
    `E-mail : ${payload.email}`,
    `Objet : ${subjectLabel}`,
    "",
    "Message :",
    payload.message,
    "",
    "—",
    "VAR 4 · Du Virtuel au Réel · Kinshasa, 09 août 2026",
  ].join("\n");
}

function buildContactEmailHtml(payload: ContactFormPayload, subjectLabel: string) {
  const fullName = escapeHtml(payload.fullName);
  const email = escapeHtml(payload.email);
  const subject = escapeHtml(subjectLabel);
  const message = escapeHtml(payload.message);

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Nouveau message VAR 4</title>
  </head>
  <body style="margin:0;padding:0;background-color:#edf4fb;font-family:Arial,Helvetica,sans-serif;color:#0f2440;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#edf4fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid rgba(25,62,108,0.08);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#193e6c 0%,#245089 100%);">
                <p style="margin:0 0 8px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#77deb9;">
                  VAR 4 · Contact
                </p>
                <h1 style="margin:0;font-size:28px;line-height:1.05;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;color:#ffffff;">
                  Nouveau message
                </h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.82);">
                  Formulaire de contact · Du Virtuel au Réel
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:0 0 14px;">
                      <p style="margin:0 0 6px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4c98d2;">
                        Nom complet
                      </p>
                      <p style="margin:0;font-size:16px;line-height:1.45;font-weight:700;color:#193e6c;">${fullName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px;">
                      <p style="margin:0 0 6px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4c98d2;">
                        E-mail
                      </p>
                      <p style="margin:0;font-size:15px;line-height:1.45;">
                        <a href="mailto:${email}" style="color:#193e6c;text-decoration:none;font-weight:700;">${email}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px;">
                      <p style="margin:0 0 6px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4c98d2;">
                        Objet
                      </p>
                      <p style="margin:0;display:inline-block;padding:8px 12px;border-radius:999px;background-color:rgba(119,222,185,0.18);font-size:13px;line-height:1.4;font-weight:700;color:#193e6c;">
                        ${subject}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f7fbff;border:1px solid rgba(25,62,108,0.08);border-radius:14px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 10px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4c98d2;">
                        Message
                      </p>
                      <p style="margin:0;font-size:15px;line-height:1.65;color:#0f2440;white-space:pre-wrap;">${message}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-radius:999px;background-color:#193e6c;">
                      <a href="mailto:${email}?subject=${encodeURIComponent(`Re: ${subjectLabel}`)}" style="display:inline-block;padding:12px 18px;font-size:13px;line-height:1;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                        Répondre à ${fullName}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 24px;border-top:1px solid rgba(25,62,108,0.08;background-color:#f7fbff;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(15,36,64,0.62);">
                  VAR 4 · Du Virtuel au Réel<br />
                  Kinshasa · 09 août 2026 · Jeunesse ya Bonne Qualité
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
