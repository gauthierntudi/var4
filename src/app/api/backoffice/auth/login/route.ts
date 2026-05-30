import { NextResponse } from "next/server";
import {
  createBackofficeSessionToken,
  isBackofficeConfigured,
  setBackofficeSessionCookie,
  verifyBackofficePassword,
} from "@/lib/backoffice-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isBackofficeConfigured()) {
    return NextResponse.json(
      { error: "Backoffice non configuré (BACKOFFICE_PASSWORD)." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyBackofficePassword(password)) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    setBackofficeSessionCookie(response, createBackofficeSessionToken());

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/backoffice/auth/login]", error);
    }

    return NextResponse.json({ error: "Connexion impossible." }, { status: 500 });
  }
}
