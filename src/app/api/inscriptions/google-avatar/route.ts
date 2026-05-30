import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "lh3.googleusercontent.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL manquante." }, { status: 400 });
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "URL non autorisée." }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());

  if (!upstream.ok) {
    return NextResponse.json({ error: "Image introuvable." }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
