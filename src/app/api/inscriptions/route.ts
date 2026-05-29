import { NextResponse } from "next/server";
import { getPhotoFromFormData, parseInscriptionFormData } from "@/lib/inscription-validation";
import { prisma } from "@/lib/prisma";
import { isS3Configured, uploadInscriptionPhoto } from "@/lib/s3";

export const runtime = "nodejs";
export const maxDuration = 30;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de données non configurée (DATABASE_URL)." },
      { status: 503 },
    );
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "Stockage S3 non configuré (AWS_*)." },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const payload = parseInscriptionFormData(formData);
    const photo = getPhotoFromFormData(formData);

    let photoUrl: string | null = null;
    let photoKey: string | null = null;

    if (photo) {
      const uploaded = await uploadInscriptionPhoto(photo);
      photoUrl = uploaded.url;
      photoKey = uploaded.key;
    }

    const inscription = await prisma.inscription.create({
      data: {
        ...payload,
        photoUrl,
        photoKey,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: inscription.id,
        createdAt: inscription.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'inscription";
    const status = message.includes("invalide") || message.includes("dépasser") ? 400 : 500;

    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/inscriptions]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
