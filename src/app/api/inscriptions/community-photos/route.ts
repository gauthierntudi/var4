import { NextResponse } from "next/server";
import { getCollaborateCommunityPhotos } from "@/lib/collaborate-community";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCollaborateCommunityPhotos();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/inscriptions/community-photos]", error);
    }

    return NextResponse.json({ error: "Impossible de charger les photos." }, { status: 500 });
  }
}
