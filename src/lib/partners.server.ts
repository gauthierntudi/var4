import { unstable_noStore as noStore } from "next/cache";
import { mapPartnerRecord } from "@/lib/partners";
import { prisma } from "@/lib/prisma";

export async function getActivePartners() {
  noStore();

  if (!process.env.DATABASE_URL) {
    return [];
  }

  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      websiteUrl: true,
      logoUrl: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return partners.map(mapPartnerRecord);
}

export async function listBackofficePartners() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return partners.map(mapPartnerRecord);
}
