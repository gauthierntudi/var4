import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getBadgeSharePageUrl } from "@/lib/badge-share";
import { isS3Configured, uploadBadgeShare } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "Stockage S3 non configuré (AWS_*)." },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const badge = formData.get("badge");

    if (!(badge instanceof File) || badge.size === 0) {
      return NextResponse.json({ error: "Badge manquant." }, { status: 400 });
    }

    const shareId = randomUUID();
    const uploaded = await uploadBadgeShare(badge, shareId);
    const origin = new URL(request.url).origin;

    return NextResponse.json(
      {
        ok: true,
        shareId: uploaded.shareId,
        imageUrl: uploaded.url,
        pageUrl: getBadgeSharePageUrl(uploaded.shareId, origin),
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de publier le badge.";

    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/inscriptions/badge-share]", error);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
