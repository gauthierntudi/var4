import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await prisma.inscription.findMany({
      select: {
        id: true,
        fullName: true,
        city: true,
        photoUrl: true,
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/inscriptions/feed]", error);
    }

    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
