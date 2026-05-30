import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const BACKOFFICE_COOKIE = "var4_backoffice_session";
export const BACKOFFICE_SESSION_MAX_AGE = 60 * 60 * 8;

export function isBackofficeConfigured() {
  return Boolean(process.env.BACKOFFICE_PASSWORD?.trim());
}

function getSessionSecret() {
  const secret =
    process.env.BACKOFFICE_SESSION_SECRET?.trim() ?? process.env.BACKOFFICE_PASSWORD?.trim();

  if (!secret) {
    throw new Error("Backoffice non configuré.");
  }

  return secret;
}

export function createBackofficeSessionToken() {
  const expiresAt = Date.now() + BACKOFFICE_SESSION_MAX_AGE * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");

  return `${expiresAt}.${signature}`;
}

export function verifyBackofficeSessionToken(token: string | undefined | null) {
  if (!token || !isBackofficeConfigured()) return false;

  const [expiresRaw, signature] = token.split(".");
  const expiresAt = Number.parseInt(expiresRaw ?? "", 10);

  if (!Number.isFinite(expiresAt) || !signature || Date.now() > expiresAt) {
    return false;
  }

  const payload = `admin:${expiresAt}`;
  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");

  try {
    const left = Buffer.from(signature, "hex");
    const right = Buffer.from(expected, "hex");

    if (left.length !== right.length) return false;

    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function verifyBackofficePassword(password: string) {
  const expected = process.env.BACKOFFICE_PASSWORD?.trim();

  if (!expected) return false;

  try {
    const left = Buffer.from(password);
    const right = Buffer.from(expected);

    if (left.length !== right.length) return false;

    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function getBackofficeSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(BACKOFFICE_COOKIE)?.value ?? null;
}

export async function isBackofficeAuthenticated() {
  const token = await getBackofficeSessionToken();
  return verifyBackofficeSessionToken(token);
}

export function setBackofficeSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(BACKOFFICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BACKOFFICE_SESSION_MAX_AGE,
  });
}

export function clearBackofficeSessionCookie(response: NextResponse) {
  response.cookies.set(BACKOFFICE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorizedBackofficeResponse() {
  return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
}
