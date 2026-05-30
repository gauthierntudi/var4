import { NextResponse } from "next/server";
import {
  isBackofficeAuthenticated,
  unauthorizedBackofficeResponse,
} from "@/lib/backoffice-auth";
import {
  exportBackofficeInscriptionsWorkbook,
  getBackofficeExportFilename,
} from "@/lib/backoffice-inscriptions";

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
    const search = searchParams.get("search") ?? "";
    const buffer = await exportBackofficeInscriptionsWorkbook(
      search,
      new URL(request.url).origin,
    );
    const filename = getBackofficeExportFilename();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/backoffice/inscriptions/export]", error);
    }

    return NextResponse.json({ error: "Export Excel impossible." }, { status: 500 });
  }
}
