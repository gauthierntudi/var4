import { NextResponse } from "next/server";
import { getActivePartners } from "@/lib/partners.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await getActivePartners();

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/partners]", error);
    }

    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
