import type { ExistingInscriptionRecord } from "@/lib/inscription-types";
import { getContactLookupValues } from "@/lib/inscription-contact";
import { resolveInscriptionFeedPhotoUrl } from "@/lib/inscription-feed";
import { prisma } from "@/lib/prisma";

export type { ExistingInscriptionRecord } from "@/lib/inscription-types";

export async function findInscriptionByContact(contact: string) {
  const lookupValues = getContactLookupValues(contact);

  const row = await prisma.inscription.findFirst({
    where: {
      contact: { in: lookupValues },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      communityTitle: true,
      contact: true,
      photoKey: true,
      photoUrl: true,
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    fullName: row.fullName,
    communityTitle: row.communityTitle,
    contact: row.contact,
    photoUrl: resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl),
  } satisfies ExistingInscriptionRecord;
}
