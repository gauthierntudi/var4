import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadPartnerLogo, isS3Configured, resolvePartnerLogoKey } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  if (!isS3Configured()) {
    return NextResponse.json({ error: "Stockage S3 non configuré." }, { status: 503 });
  }

  try {
    const partner = await prisma.partner.findUnique({
      where: { id },
      select: { logoKey: true, logoUrl: true, isActive: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const key = resolvePartnerLogoKey(partner.logoKey, partner.logoUrl);

    if (!key) {
      return NextResponse.json({ error: "Logo indisponible." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const logo = await downloadPartnerLogo(key);

    return new NextResponse(Buffer.from(logo.body), {
      headers: {
        "Content-Type": logo.contentType,
        "Cache-Control": partner.isActive
          ? "public, max-age=3600, stale-while-revalidate=86400"
          : "private, max-age=60",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/partners/logo]", error);
    }

    return NextResponse.json({ error: "Impossible de charger le logo." }, { status: 500 });
  }
}
