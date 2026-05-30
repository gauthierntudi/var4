import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadInscriptionPhoto, isS3Configured, resolveInscriptionPhotoKey } from "@/lib/s3";

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
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      select: { photoKey: true, photoUrl: true },
    });

    if (!inscription) {
      return NextResponse.json({ error: "Inscription introuvable." }, { status: 404 });
    }

    const key = resolveInscriptionPhotoKey(inscription.photoKey, inscription.photoUrl);

    if (!key) {
      return NextResponse.json({ error: "Photo indisponible." }, { status: 404 });
    }

    const photo = await downloadInscriptionPhoto(key);

    return new NextResponse(Buffer.from(photo.body), {
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/inscriptions/photo]", error);
    }

    return NextResponse.json({ error: "Impossible de charger la photo." }, { status: 500 });
  }
}
