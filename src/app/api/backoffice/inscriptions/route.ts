import { NextResponse } from "next/server";
import {
  isBackofficeAuthenticated,
  unauthorizedBackofficeResponse,
} from "@/lib/backoffice-auth";
import { listBackofficeInscriptions } from "@/lib/backoffice-inscriptions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isBackofficeAuthenticated())) {
    return unauthorizedBackofficeResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Base de données non configurée." },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const search = searchParams.get("search") ?? "";

    const data = await listBackofficeInscriptions({
      page: Number.isFinite(page) ? page : 1,
      search,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/backoffice/inscriptions]", error);
    }

    return NextResponse.json({ error: "Impossible de charger les inscrits." }, { status: 500 });
  }
}
