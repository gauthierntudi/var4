import { NextResponse } from "next/server";
import { clearBackofficeSessionCookie } from "@/lib/backoffice-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearBackofficeSessionCookie(response);
  return response;
}
