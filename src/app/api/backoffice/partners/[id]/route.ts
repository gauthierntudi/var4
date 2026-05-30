import { NextResponse } from "next/server";
import {
  isBackofficeAuthenticated,
  unauthorizedBackofficeResponse,
} from "@/lib/backoffice-auth";
import {
  getOptionalPartnerLogoFromFormData,
  parsePartnerUpdateFormData,
  partnerLogoProxyUrl,
} from "@/lib/partners";
import { prisma } from "@/lib/prisma";
import { deletePartnerLogo, isS3Configured, uploadPartnerLogo } from "@/lib/s3";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isBackofficeAuthenticated())) {
    return unauthorizedBackofficeResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  try {
    const { id } = await context.params;
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
    }

    await prisma.partner.delete({ where: { id } });

    try {
      await deletePartnerLogo(partner.logoKey);
    } catch {
      // Logo déjà absent ou S3 indisponible — la suppression DB reste valide.
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DELETE /api/backoffice/partners/[id]]", error);
    }

    return NextResponse.json({ error: "Impossible de supprimer le partenaire." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
    }

    const formData = await request.formData();
    const payload = parsePartnerUpdateFormData(formData);
    const logo = getOptionalPartnerLogoFromFormData(formData);

    let logoUrl = partner.logoUrl;
    let logoKey = partner.logoKey;
    const previousLogoKey = partner.logoKey;

    if (logo) {
      const uploaded = await uploadPartnerLogo(logo);
      logoUrl = uploaded.url;
      logoKey = uploaded.key;
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        name: payload.name,
        sortOrder: payload.sortOrder,
        logoUrl,
        logoKey,
      },
    });

    if (logo && previousLogoKey !== logoKey) {
      try {
        await deletePartnerLogo(previousLogoKey);
      } catch {
        // L'ancien logo peut déjà être absent.
      }
    }

    return NextResponse.json({
      ok: true,
      item: {
        id: updated.id,
        name: updated.name,
        websiteUrl: updated.websiteUrl,
        logoUrl: partnerLogoProxyUrl(updated.id, updated.updatedAt.getTime()),
        sortOrder: updated.sortOrder,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de modifier le partenaire.";
    const status =
      message.includes("invalide") ||
      message.includes("dépasser") ||
      message.includes("Format")
        ? 400
        : 500;

    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/backoffice/partners/[id]]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isBackofficeAuthenticated())) {
    return unauthorizedBackofficeResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { isActive?: boolean };
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
    }

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: updated.id,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PATCH /api/backoffice/partners/[id]]", error);
    }

    return NextResponse.json({ error: "Impossible de mettre à jour le partenaire." }, { status: 500 });
  }
}
