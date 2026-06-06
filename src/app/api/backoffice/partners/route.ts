import { NextResponse } from "next/server";
import {
  isBackofficeAuthenticated,
  unauthorizedBackofficeResponse,
} from "@/lib/backoffice-auth";
import { getPartnerLogoFromFormData, parsePartnerFormData, partnerLogoProxyUrl } from "@/lib/partners";
import { listBackofficePartners } from "@/lib/partners.server";
import { revalidatePartnerPublicPages } from "@/lib/revalidate-partners";
import { prisma } from "@/lib/prisma";
import { isS3Configured, uploadPartnerLogo } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isBackofficeAuthenticated())) {
    return unauthorizedBackofficeResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  try {
    const items = await listBackofficePartners();
    return NextResponse.json({ items });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GET /api/backoffice/partners]", error);
    }

    return NextResponse.json({ error: "Impossible de charger les partenaires." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isBackofficeAuthenticated())) {
    return unauthorizedBackofficeResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  if (!isS3Configured()) {
    return NextResponse.json({ error: "Stockage S3 non configuré." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const payload = parsePartnerFormData(formData);
    const logo = getPartnerLogoFromFormData(formData);
    const uploaded = await uploadPartnerLogo(logo);

    const partner = await prisma.partner.create({
      data: {
        name: payload.name,
        websiteUrl: payload.websiteUrl,
        logoUrl: uploaded.url,
        logoKey: uploaded.key,
        sortOrder: payload.sortOrder,
      },
    });

    revalidatePartnerPublicPages();

    return NextResponse.json(
      {
        ok: true,
        item: {
          id: partner.id,
          name: partner.name,
          websiteUrl: partner.websiteUrl,
          logoUrl: partnerLogoProxyUrl(partner.id, partner.updatedAt.getTime()),
          sortOrder: partner.sortOrder,
          isActive: partner.isActive,
          createdAt: partner.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible d'ajouter le partenaire.";
    const status =
      message.includes("invalide") ||
      message.includes("requis") ||
      message.includes("dépasser") ||
      message.includes("Format")
        ? 400
        : 500;

    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/backoffice/partners]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
