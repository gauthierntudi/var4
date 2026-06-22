import { NextResponse } from "next/server";
import { getPhotoFromFormData, parseInscriptionFormData } from "@/lib/inscription-validation";
import {
  findInscriptionByIdForContact,
  updateInscriptionById,
} from "@/lib/inscriptions.server";
import { isS3Configured } from "@/lib/s3";

export const runtime = "nodejs";

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de données non configurée (DATABASE_URL)." },
      { status: 503 },
    );
  }

  try {
    const { id } = await context.params;
    const contact = new URL(request.url).searchParams.get("contact")?.trim();

    if (!contact) {
      return NextResponse.json({ error: "Contact requis." }, { status: 400 });
    }

    const inscription = await findInscriptionByIdForContact(id, contact);

    if (!inscription) {
      return NextResponse.json({ error: "Inscription introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, inscription }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la lecture";

    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/inscriptions/[id]]", error);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const formData = await request.formData();
    const payload = parseInscriptionFormData(formData);
    const photo = getPhotoFromFormData(formData);

    const updated = await updateInscriptionById(id, payload, photo);

    return NextResponse.json(
      {
        ok: true,
        id: updated.id,
        fullName: updated.fullName,
        communityTitle: updated.communityTitle,
        photoUrl: updated.photoUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    const status =
      message.includes("introuvable")
        ? 404
        : message.includes("invalide") ||
            message.includes("dépasser") ||
            message.includes("modifiée") ||
            message.includes("utilisé")
          ? 400
          : 500;

    if (process.env.NODE_ENV === "development") {
      console.error("[PATCH /api/inscriptions/[id]]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
