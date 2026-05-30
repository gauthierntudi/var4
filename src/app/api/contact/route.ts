import { NextResponse } from "next/server";
import { isSmtpConfigured, parseContactPayload } from "@/lib/contact";
import { sendContactEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { error: "Service de contact temporairement indisponible." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const payload = parseContactPayload(body);
    await sendContactEmail(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible d'envoyer le message.";
    const status =
      message.includes("invalide") ||
      message.includes("Indiquez") ||
      message.includes("Choisissez") ||
      message.includes("Précisez") ||
      message.includes("doit contenir") ||
      message.includes("trop long")
        ? 400
        : 500;

    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/contact]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
