import type { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { resolveInscriptionFeedPhotoUrl } from "@/lib/inscription-feed";
import { prisma } from "@/lib/prisma";

export type BackofficeInscriptionRow = {
  id: string;
  fullName: string;
  contact: string;
  city: string;
  socialNetwork: string;
  communityTitle: string;
  photoUrl: string | null;
  createdAt: string;
};

const PAGE_SIZE = 50;

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function mapInscription(row: {
  id: string;
  fullName: string;
  contact: string;
  city: string;
  socialNetwork: string;
  communityTitle: string;
  photoUrl: string | null;
  photoKey: string | null;
  createdAt: Date;
}): BackofficeInscriptionRow {
  return {
    id: row.id,
    fullName: row.fullName,
    contact: row.contact,
    city: row.city,
    socialNetwork: row.socialNetwork,
    communityTitle: row.communityTitle,
    photoUrl: resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl),
    createdAt: row.createdAt.toISOString(),
  };
}

function buildSearchFilter(search: string): Prisma.InscriptionWhereInput | undefined {
  const query = search.trim();

  if (!query) return undefined;

  return {
    OR: [
      { fullName: { contains: query, mode: "insensitive" } },
      { contact: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { communityTitle: { contains: query, mode: "insensitive" } },
      { socialNetwork: { contains: query, mode: "insensitive" } },
      { pseudo: { contains: query, mode: "insensitive" } },
    ],
  };
}

export async function listBackofficeInscriptions(options: {
  page?: number;
  search?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const where = buildSearchFilter(options.search ?? "");

  const [total, rows] = await Promise.all([
    prisma.inscription.count({ where }),
    prisma.inscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    items: rows.map(mapInscription),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function exportBackofficeInscriptionsWorkbook(search = "", origin = "") {
  const where = buildSearchFilter(search);

  const rows = await prisma.inscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const sheetRows = rows.map((row) => {
    const photoPath = resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl);
    const photo =
      photoPath && origin && photoPath.startsWith("/") ? `${origin}${photoPath}` : (photoPath ?? "");

    return {
      Date: formatDateTime(row.createdAt),
      "Nom complet": row.fullName,
      "E-mail / Téléphone": row.contact,
      Ville: row.city,
      "Réseau social": row.socialNetwork,
      "Titre communauté": row.communityTitle,
      Photo: photo,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Inscrits");

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 28 },
    { wch: 30 },
    { wch: 18 },
    { wch: 16 },
    { wch: 28 },
    { wch: 42 },
  ];

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function getBackofficeExportFilename() {
  const stamp = new Intl.DateTimeFormat("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(/[/,: ]/g, "-");

  return `var4-inscrits-${stamp}.xlsx`;
}
